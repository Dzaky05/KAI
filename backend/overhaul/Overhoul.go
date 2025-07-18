package overhaul

import (
	"fmt" // Import fmt untuk sprintf di Excel/PDF
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/gorm"

	// Import clause untuk eager loading jika diperlukan
	// Import untuk Excel
	"github.com/xuri/excelize/v2"
	// Import untuk PDF
	"github.com/jung-kurt/gofpdf"
)

// Struct model sesuai dengan skema database dan kebutuhan frontend

// History mewakili struktur data untuk riwayat overhaul
type History struct {
	HistoryID   int       `json:"id" gorm:"column:history_id;primaryKey;autoIncrement"`
	Timestamp   time.Time `json:"timestamp" gorm:"column:timestamp"`
	Description string    `json:"description" gorm:"column:description"`
	OverhaulID  int       `gorm:"column:overhaul_id"` // Pastikan nama kolom ini sesuai di DB
}

// Personalia, Materials, Inventory - Struct parsial untuk relasi
type Personalia struct {
	PersonaliaID int    `gorm:"column:personalia_id;primaryKey"`
	NIP          string `json:"nip" gorm:"column:nip"`
}

type Materials struct {
	MaterialsID   int    `gorm:"column:materials_id;primaryKey"`
	MaterialsName string `json:"materials_name" gorm:"column:materials_name"`
}

type Inventory struct {
	InventoryID int    `gorm:"column:inventory_id;primaryKey"`
	Name        string `json:"name" gorm:"column:name"`
}

// Overhaul mewakili struktur data untuk item overhaul
type Overhaul struct {
	gorm.Model
	OverhaulID int       `json:"id" gorm:"column:overhaul_id;primaryKey;autoIncrement"`
	Name       string    `json:"name" gorm:"column:name"`
	Location   string    `json:"lokasi" gorm:"column:location"`
	Status     string    `json:"status" gorm:"column:status"`
	Estimate   time.Time `json:"estimasi" gorm:"column:estimate"`
	Progress   int       `json:"progress" gorm:"column:progress"`

	// Foreign Keys (gunakan pointer untuk nullable)
	PersonaliaID *int `json:"personalia_id,omitempty" gorm:"column:personalia_id"`
	MaterialsID  *int `json:"materials_id,omitempty" gorm:"column:materials_id"`
	InventoryID  *int `json:"inventory_id,omitempty" gorm:"column:inventory_id"`

	// Relasi eksplisit untuk Preload
	Personalia *Personalia `json:"personalia,omitempty" gorm:"foreignKey:PersonaliaID;references:PersonaliaID"`
	Materials  *Materials  `json:"materials,omitempty" gorm:"foreignKey:MaterialsID;references:MaterialsID"`
	Inventory  *Inventory  `json:"inventory,omitempty" gorm:"foreignKey:InventoryID;references:InventoryID"`

	// Relasi One-to-Many ke History
	History []History `json:"history,omitempty" gorm:"foreignKey:OverhaulID;constraint:OnDelete:CASCADE"`
}

func (Personalia) TableName() string {
	return "personalia"
}
func (Materials) TableName() string {
	return "materials"
}
func (Inventory) TableName() string {
	return "inventory"
}
func (Overhaul) TableName() string {
	return "overhaul"
}
func (History) TableName() string {
	return "history"
}

var db *gorm.DB

func Init(dbInstance *gorm.DB) {
	db = dbInstance
	log.Println("Overhaul module initialized.")
	// Penting: Jika tabel history.overhaul_id tidak ada, GORM.AutoMigrate bisa membantu membuatnya.
	// Namun, pastikan Anda ingin GORM memodifikasi skema DB Anda.
	// err := db.AutoMigrate(&Overhaul{}, &History{})
	// if err != nil {
	// 	log.Printf("Error auto-migrating Overhaul/History tables: %v", err)
	// }
}

// getAllOverhaul mengambil semua item overhaul dari database beserta relasi
func getAllOverhaul(c *gin.Context) {
	var overhaulItems []Overhaul
	// Preload semua relasi
	if result := db.Preload("History").Preload("Personalia").Preload("Materials").Preload("Inventory").Find(&overhaulItems); result.Error != nil {
		log.Printf("Error fetching all overhaul items: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overhaul data", "details": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, overhaulItems)
}

// getOverhaulByID mengambil item overhaul berdasarkan ID beserta relasi
func getOverhaulByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid overhaul ID"})
		return
	}

	var item Overhaul
	if result := db.Preload("History").Preload("Personalia").Preload("Materials").Preload("Inventory").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Overhaul item not found"})
		} else {
			log.Printf("Error fetching overhaul item with ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overhaul data", "details": result.Error.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, item)
}

// createOverhaul menambahkan item overhaul baru ke database beserta riwayatnya
func createOverhaul(c *gin.Context) {
	var newItem Overhaul
	// Log payload yang diterima
	if err := c.ShouldBindJSON(&newItem); err != nil {
		log.Printf("Error binding JSON for createOverhaul: %v. Raw request body might be malformed.", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}
	log.Printf("Received payload for createOverhaul: %+v", newItem)

	// Validasi sederhana
	if newItem.Name == "" || newItem.Location == "" || newItem.Status == "" || newItem.Estimate.IsZero() {
		log.Printf("Validation failed for createOverhaul: required fields are empty or invalid estimate date. Item: %+v", newItem)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fields 'name', 'lokasi', 'status', and 'estimasi' are required."})
		return
	}
	if newItem.Progress < 0 || newItem.Progress > 100 {
		log.Printf("Validation failed for createOverhaul: invalid progress %d. Item: %+v", newItem)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Progress must be between 0 and 100."})
		return
	}

	newItem.OverhaulID = 0 // Biarkan GORM mengisi ID auto-increment

	log.Printf("Attempting to create overhaul item in DB: %+v", newItem)
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error creating overhaul item in DB: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create overhaul item", "details": result.Error.Error()})
		return
	}
	log.Printf("Successfully created overhaul item with ID: %d", newItem.OverhaulID)

	var createdItem Overhaul
	db.Preload("History").Preload("Personalia").Preload("Materials").Preload("Inventory").First(&createdItem, newItem.OverhaulID)

	c.JSON(http.StatusCreated, createdItem)
}

// updateOverhaul memperbarui item overhaul di database beserta riwayatnya
func updateOverhaul(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid overhaul ID"})
		return
	}

	var updatedItem Overhaul
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		log.Printf("Error binding JSON for updateOverhaul: %v. Raw request body might be malformed.", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}
	log.Printf("Received payload for updateOverhaul (ID %d): %+v", id, updatedItem)

	// Validasi sederhana
	if updatedItem.Name == "" || updatedItem.Location == "" || updatedItem.Status == "" || updatedItem.Estimate.IsZero() {
		log.Printf("Validation failed for updateOverhaul: required fields are empty or invalid estimate date. Item: %+v", updatedItem)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fields 'name', 'lokasi', 'status', and 'estimasi' are required."})
		return
	}
	if updatedItem.Progress < 0 || updatedItem.Progress > 100 {
		log.Printf("Validation failed for updateOverhaul: invalid progress %d. Item: %+v", updatedItem)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Progress must be between 0 and 100."})
		return
	}

	var item Overhaul
	if result := db.Preload("History").Preload("Personalia").Preload("Materials").Preload("Inventory").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Overhaul item not found"})
		} else {
			log.Printf("Error finding overhaul item with ID %d for update: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find overhaul item", "details": result.Error.Error()})
		}
		return
	}

	// Update field item yang ada dengan data dari updatedItem
	item.Name = updatedItem.Name
	item.Location = updatedItem.Location
	item.Status = updatedItem.Status
	item.Estimate = updatedItem.Estimate
	item.Progress = updatedItem.Progress
	item.PersonaliaID = updatedItem.PersonaliaID
	item.MaterialsID = updatedItem.MaterialsID
	item.InventoryID = updatedItem.InventoryID

	// Mengelola relasi History:
	// Hapus semua riwayat yang terkait saat ini dan tambahkan yang baru dari updatedItem
	if err := db.Model(&item).Association("History").Clear(); err != nil {
		log.Printf("Error clearing history for overhaul ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear existing history", "details": err.Error()})
		return
	}
	if len(updatedItem.History) > 0 {
		if err := db.Model(&item).Association("History").Append(updatedItem.History); err != nil {
			log.Printf("Error appending new history for overhaul ID %d: %v", id, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add new history", "details": err.Error()})
			return
		}
	}

	log.Printf("Attempting to save updated overhaul item ID %d: %+v", id, item)
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error updating overhaul item with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update overhaul item", "details": result.Error.Error()})
		return
	}
	log.Printf("Successfully updated overhaul item ID: %d", item.OverhaulID)

	var savedItem Overhaul
	db.Preload("History").Preload("Personalia").Preload("Materials").Preload("Inventory").First(&savedItem, item.OverhaulID)

	c.JSON(http.StatusOK, savedItem)
}

// deleteOverhaul menghapus item overhaul dari database beserta riwayat terkait
func deleteOverhaul(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid overhaul ID"})
		return
	}

	var item Overhaul
	if result := db.Preload("History").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Overhaul item not found"})
		} else {
			log.Printf("Error finding overhaul item with ID %d for deletion: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find overhaul item", "details": result.Error.Error()})
		}
		return
	}

	log.Printf("Attempting to delete overhaul item with ID: %d", id)
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error deleting overhaul item with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete overhaul item", "details": result.Error.Error()})
		return
	}
	log.Printf("Successfully deleted overhaul item with ID: %d", id)

	c.Status(http.StatusNoContent)
}

// exportOverhaulToExcel menggenerasi dan mengirimkan file Excel data overhaul
func exportOverhaulToExcel(c *gin.Context) {
	var overhaulItems []Overhaul
	if result := db.Preload("Personalia").Preload("Materials").Preload("Inventory").Find(&overhaulItems); result.Error != nil {
		log.Printf("Error fetching overhaul for Excel export: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overhaul data for export"})
		return
	}

	f := excelize.NewFile()
	sheetName := "Overhaul Data"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		log.Printf("Error creating new Excel sheet: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Excel file"})
		return
	}

	// Set header kolom
	headers := []string{"ID", "Nama", "Lokasi", "Status", "Estimasi", "Progress", "NIP Personalia", "Nama Material", "Nama Inventaris"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1) // Baris pertama
		f.SetCellValue(sheetName, cell, header)
	}

	// Isi data overhaul
	for i, item := range overhaulItems {
		rowNum := i + 2 // Mulai dari baris kedua setelah header
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), item.OverhaulID)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowNum), item.Name)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowNum), item.Location)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", rowNum), item.Status)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", rowNum), item.Estimate.Format("2006-01-02")) // Format tanggal
		f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowNum), item.Progress)

		// Isi data relasi
		personaliaNIP := ""
		if item.Personalia != nil && item.Personalia.NIP != "" { // Cek nil pointer
			personaliaNIP = item.Personalia.NIP
		}
		f.SetCellValue(sheetName, fmt.Sprintf("G%d", rowNum), personaliaNIP)

		materialsName := ""
		if item.Materials != nil && item.Materials.MaterialsName != "" { // Cek nil pointer
			materialsName = item.Materials.MaterialsName
		}
		f.SetCellValue(sheetName, fmt.Sprintf("H%d", rowNum), materialsName)

		inventoryName := ""
		if item.Inventory != nil && item.Inventory.Name != "" { // Cek nil pointer
			inventoryName = item.Inventory.Name
		}
		f.SetCellValue(sheetName, fmt.Sprintf("I%d", rowNum), inventoryName)
	}

	f.SetActiveSheet(index)

	// Set header HTTP untuk download file
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=overhaul_data_%s.xlsx", time.Now().Format("20060102")))
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Cache-Control", "no-cache")

	if err := f.Write(c.Writer); err != nil {
		log.Printf("Error writing Excel file to response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write Excel file to response"})
		return
	}
}

// exportOverhaulToPDF menggenerasi dan mengirimkan file PDF data overhaul
func exportOverhaulToPDF(c *gin.Context) {
	var overhaulItems []Overhaul
	if result := db.Preload("Personalia").Preload("Materials").Preload("Inventory").Find(&overhaulItems); result.Error != nil {
		log.Printf("Error fetching overhaul for PDF export: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overhaul data for export"})
		return
	}

	pdf := gofpdf.New("P", "mm", "A4", "") // Portrait, milimeter, A4
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Data Overhaul")
	pdf.Ln(12) // Line break

	pdf.SetFont("Arial", "B", 8) // Font lebih kecil untuk header agar muat
	// Header Tabel
	header := []string{"ID", "Nama", "Lokasi", "Status", "Estimasi", "Progress", "NIP Personalia", "Nama Material", "Nama Inventaris"}
	// Sesuaikan lebar kolom agar muat di A4 (total lebar A4 sekitar 210mm, margin 10mm kiri-kanan = 190mm usable)
	colWidths := []float64{10, 25, 25, 20, 25, 15, 25, 25, 20}

	// Print header
	for i, h := range header {
		pdf.Cell(colWidths[i], 7, h)
	}
	pdf.Ln(-1) // New line

	pdf.SetFont("Arial", "", 7) // Font untuk data, lebih kecil lagi
	// Data Tabel
	for _, item := range overhaulItems {
		personaliaNIP := ""
		if item.Personalia != nil && item.Personalia.NIP != "" {
			personaliaNIP = item.Personalia.NIP
		}

		materialsName := ""
		if item.Materials != nil && item.Materials.MaterialsName != "" {
			materialsName = item.Materials.MaterialsName
		}

		inventoryName := ""
		if item.Inventory != nil && item.Inventory.Name != "" {
			inventoryName = item.Inventory.Name
		}

		row := []string{
			strconv.Itoa(item.OverhaulID),
			item.Name,
			item.Location,
			item.Status,
			item.Estimate.Format("2006-01-02"), // Format tanggal
			strconv.Itoa(item.Progress),
			personaliaNIP,
			materialsName,
			inventoryName,
		}

		// Cetak setiap sel data
		for i, data := range row {
			if pdf.GetStringWidth(data) > colWidths[i] {
				for len(data) > 0 && pdf.GetStringWidth(data) > colWidths[i] {
					data = data[:len(data)-1]
				}
				if len(data) > 3 {
					data = data[:len(data)-3] + "..."
				}
			}
			pdf.Cell(colWidths[i], 7, data)
		}
		pdf.Ln(-1) // New line for next row
	}

	// Set header HTTP untuk download file
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=overhaul_data_%s.pdf", time.Now().Format("20060102")))
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Cache-Control", "no-cache")

	if err := pdf.Output(c.Writer); err != nil {
		log.Printf("Error writing PDF file to response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write PDF file to response"})
		return
	}
}

// RegisterRoutes
func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/", getAllOverhaul)
	r.GET("/:id", getOverhaulByID)
	r.POST("/", createOverhaul)
	r.PUT("/:id", updateOverhaul)
	r.DELETE("/:id", deleteOverhaul)
	// Endpoint untuk export Excel
	r.GET("/export/excel", exportOverhaulToExcel)
	// Endpoint untuk export PDF
	r.GET("/export/pdf", exportOverhaulToPDF)
}
