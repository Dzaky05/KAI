package quality

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/gorm"
	// Import clause for eager loading
)

// Minimal Structs for Related Departments (add these near your QualityControl struct)
type Produksi struct {
	ProduksiID uint `gorm:"column:produksi_id;primaryKey"`
}

type Overhaul struct {
	OverhaulID uint `gorm:"column:overhaul_id;primaryKey"`
}

type Rekayasa struct {
	RekayasaID uint `gorm:"column:rekayasa_id;primaryKey"`
}

type Inventory struct {
	ID uint `gorm:"column:id;primaryKey"` // Assuming 'id' is the primary key column name
}

// Struct model sesuai dengan tabel quality_control dan relasi

// QualityControl mewakili struktur data untuk entri QC
type QualityControl struct {
	gorm.Model     // Menyediakan ID (qc_id jika mapping benar), CreatedAt, UpdatedAt, DeletedAt
	QcID       int `json:"id" gorm:"column:qc_id;primaryKey"`

	ProductName string    `json:"product" gorm:"column:product_name"` // Mapping product frontend ke product_name
	BatchCode   string    `json:"batch" gorm:"column:batch_code"`     // Mapping batch frontend ke batch_code
	Status      string    `json:"status" gorm:"column:status"`
	TestedCount int       `json:"tested" gorm:"column:tested_count"`    // Mapping tested frontend ke tested_count
	PassedCount int       `json:"passed" gorm:"column:passed_count"`    // Mapping passed frontend ke passed_count
	QcDate      time.Time `json:"date" gorm:"column:qc_date;type:date"` // Mapping date frontend ke qc_date
	Department  string    `json:"department" gorm:"column:department"`

	// Foreign Keys ke tabel lain (opsional)
	ProduksiID  *uint `json:"produksi_id,omitempty" gorm:"column:produksi_id"`   // Use pointer for nullable FK
	OverhaulID  *uint `json:"overhaul_id,omitempty" gorm:"column:overhaul_id"`   // Use pointer for nullable FK
	RekayasaID  *uint `json:"rekayasa_id,omitempty" gorm:"column:rekayasa_id"`   // Use pointer for nullable FK
	InventoryID *uint `json:"inventory_id,omitempty" gorm:"column:inventory_id"` // Use pointer for nullable FK

	// Relasi ke objek terkait (jika perlu dimuat)
	// GORM akan menggunakan FK di struct ini untuk memuat objek terkait jika didefinisikan
	// Produksi  *Produksi  `json:"produksi,omitempty"` // Asumsi struct Produksi sudah didefinisikan
	// Overhaul  *Overhaul  `json:"overhaul,omitempty"` // Asumsi struct Overhaul sudah didefinisikan
	// Rekayasa  *Rekayasa  `json:"rekayasa,omitempty"` // Asumsi struct Rekayasa sudah didefinisikan
	// Inventory *Inventory `json:"inventory,omitempty"` // Asumsi struct Inventory sudah didefinisikan

	// Catatan: Frontend menggunakan field `id` (string, e.g., "PRD-001") yang berbeda dengan `qc_id` (int).
	// Anda perlu memutuskan bagaimana memetakan ini. Opsi:
	// 1. Simpan kode frontend ("PRD-001") di kolom terpisah di tabel quality_control.
	// 2. Generate kode frontend di backend saat mengambil data.
	// 3. Gunakan ID database (`qc_id`) di frontend.
	// Saya akan menggunakan `qc_id` sebagai primary key database dan field transient `FrontendID` untuk kode frontend jika perlu.
	FrontendID string `json:"id" gorm:"-"` // Field transient untuk kode frontend

	// Field untuk pass rate (dihitung di Go)
	PassRate int `json:"passRate" gorm:"-"` // Field transient
}

func (QualityControl) TableName() string {
	return "quality_control"
}
func (Inventory) TableName() string {
	return "inventory"
}
func (Rekayasa) TableName() string {
	return "rekayasa"
}
func (Produksi) TableName() string {
	return "produksi"
}
func (Overhaul) TableName() string {
	return "overhaul"
}

// parseFrontendID parses a frontend ID string into department prefix and numeric ID.
// Expected format: PREFIX-NNN (e.g., PRD-123)
func parseFrontendID(frontendID string) (departmentPrefix string, numericID int, err error) {
	parts := strings.Split(frontendID, "-")
	if len(parts) != 2 {
		return "", 0, fmt.Errorf("invalid frontend ID format: %s", frontendID)
	}
	departmentPrefix = parts[0]
	numericID, err = strconv.Atoi(parts[1])
	if err != nil {
		return "", 0, fmt.Errorf("invalid numeric part in frontend ID: %s", frontendID)
	}
	return departmentPrefix, numericID, nil
}

// findProduksiIDByNumericID finds the database ID for a Produksi item by its numeric ID.
func findProduksiIDByNumericID(numericID int) (*uint, error) {
	var produksi Produksi
	// Assuming a column 'numeric_id' or similar in the 'produksi' table maps to the frontend numeric part.
	// If the frontend numeric ID directly maps to the primary key 'produksi_id', use that instead.
	// Example assumes mapping numericID to 'produksi_id':
	result := db.Select("produksi_id").First(&produksi, numericID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("error finding Produksi with ID %d: %v", numericID, result.Error)
	}
	return &produksi.ProduksiID, nil
}

// findOverhaulIDByNumericID finds the database ID for an Overhaul item by its numeric ID.
func findOverhaulIDByNumericID(numericID int) (*uint, error) {
	var overhaul Overhaul
	// Example assumes mapping numericID to 'overhaul_id':
	result := db.Select("overhaul_id").First(&overhaul, numericID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("error finding Overhaul with ID %d: %v", numericID, result.Error)
	}
	return &overhaul.OverhaulID, nil
}

// findRekayasaIDByNumericID finds the database ID for a Rekayasa item by its numeric ID.
func findRekayasaIDByNumericID(numericID int) (*uint, error) {
	var rekayasa Rekayasa
	// Example assumes mapping numericID to 'rekayasa_id':
	result := db.Select("rekayasa_id").First(&rekayasa, numericID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("error finding Rekayasa with ID %d: %v", numericID, result.Error)
	}
	return &rekayasa.RekayasaID, nil
}

// findInventoryIDByNumericID finds the database ID for an Inventory item by its numeric ID.
func findInventoryIDByNumericID(numericID int) (*uint, error) {
	var inventory Inventory
	// Example assumes mapping numericID to 'id':
	result := db.Select("id").First(&inventory, numericID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("error finding Inventory with ID %d: %v", numericID, result.Error)
	}
	return &inventory.ID, nil
}

// Helper function to generate frontend ID
func generateFrontendID(qc *QualityControl) string {
	prefix := ""
	switch qc.Department {
	case "Production":
		prefix = "PRD"
	case "Overhaul":
		prefix = "OVH"
	case "Rekayasa":
		prefix = "RKY"
	case "Kalibrasi":
		prefix = "KAL"
	default:
		prefix = "QC" // Default prefix
	}
	// Ini hanya contoh, Anda mungkin perlu mekanisme ID sequence yang lebih robust per departemen
	// atau ambil ID terkait dari FK. Untuk kesederhanaan, gunakan ID database.
	return prefix + "-" + strconv.Itoa(qc.QcID)
}

// Helper function to calculate pass rate
func calculatePassRate(qc *QualityControl) {
	if qc.TestedCount > 0 {
		qc.PassRate = int(float64(qc.PassedCount)/float64(qc.TestedCount)*100 + 0.5) // Rounding
	} else {
		qc.PassRate = 0
	}
}

// getAllQualityControl mengambil semua entri QC dari database beserta relasi (jika diperlukan)
func getAllQualityControl(c *gin.Context) {
	var qcEntries []QualityControl
	// Menggunakan Preload jika Anda mendefinisikan relasi ke tabel lain di struct QualityControl
	// if result := db.Preload(clause.Associations).Find(&qcEntries); result.Error != nil {
	if result := db.Find(&qcEntries); result.Error != nil {
		log.Printf("Error saat mengambil data QC: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data Quality Control", "details": result.Error.Error()})
		return
	}

	// Isi field transient FrontendID dan PassRate
	for i := range qcEntries {
		qcEntries[i].FrontendID = generateFrontendID(&qcEntries[i]) // Generate ID frontend
		calculatePassRate(&qcEntries[i])                            // Hitung pass rate
	}

	c.JSON(http.StatusOK, qcEntries)
}

// getQualityControlByID mengambil entri QC berdasarkan ID database
func getQualityControlByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Quality Control tidak valid"})
		return
	}

	var entry QualityControl
	// Menggunakan Preload jika diperlukan
	// if result := db.Preload(clause.Associations).First(&entry, id); result.Error != nil {
	if result := db.First(&entry, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entri Quality Control tidak ditemukan"})
		} else {
			log.Printf("Error saat mengambil entri QC dengan ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data Quality Control", "details": result.Error.Error()})
		}
		return
	}

	// Isi field transient FrontendID dan PassRate
	entry.FrontendID = generateFrontendID(&entry) // Generate ID frontend
	calculatePassRate(&entry)                     // Hitung pass rate

	c.JSON(http.StatusOK, entry)
}

// createQualityControl menambahkan entri QC baru ke database
// createQualityControl menambahkan entri QC baru ke database beserta relasi terkait
func createQualityControl(c *gin.Context) {
	var newEntry QualityControl
	if err := c.ShouldBindJSON(&newEntry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}
	//validasi department
	validDepartments := map[string]bool{
		"Production": true,
		"Overhaul":   true,
		"Rekayasa":   true,
		"Kalibrasi":  true,
	}
	if !validDepartments[newEntry.Department] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Department tidak valid"})
		return
	}

	// Validasi sederhana
	if newEntry.ProductName == "" || newEntry.BatchCode == "" || newEntry.Status == "" || newEntry.Department == "" || newEntry.TestedCount < 0 || newEntry.PassedCount < 0 || newEntry.QcDate.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (product, batch, status, department, tested, passed, date) wajib diisi dan jumlah tidak boleh negatif"})
		return
	}
	if newEntry.PassedCount > newEntry.TestedCount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jumlah lulus tidak boleh lebih besar dari jumlah diuji"})
		return
	}

	// Jika qc_id di database auto-increment, atur ke 0
	newEntry.QcID = 0

	// *** Penanganan Foreign Key berdasarkan FrontendID (kode seperti PRD-001) ***
	if newEntry.FrontendID != "" {
		deptPrefix, numericID, err := parseFrontendID(newEntry.FrontendID)
		if err != nil {
			log.Printf("Error parsing FrontendID '%s': %v", newEntry.FrontendID, err)
			// Decide how to handle invalid FrontendID: return error or ignore?
			// For now, we'll log and continue without setting FKs.
		} else {
			switch strings.ToUpper(deptPrefix) {
			case "PRD": // Produksi
				produksiID, err := findProduksiIDByNumericID(numericID)
				if err != nil {
					log.Printf("Error finding Produksi with numeric ID %d: %v", numericID, err)
					// Decide how to handle not finding related item
				} else {
					newEntry.ProduksiID = produksiID // Assign found ID (or nil if not found)
				}
			case "OVH": // Overhaul
				overhaulID, err := findOverhaulIDByNumericID(numericID)
				if err != nil {
					log.Printf("Error finding Overhaul with numeric ID %d: %v", numericID, err)
				} else {
					newEntry.OverhaulID = overhaulID
				}
			case "RKY": // Rekayasa
				rekayasaID, err := findRekayasaIDByNumericID(numericID)
				if err != nil {
					log.Printf("Error finding Rekayasa with numeric ID %d: %v", numericID, err)
				} else {
					newEntry.RekayasaID = rekayasaID
				}
			case "KAL": // Kalibrasi (assuming Kalibrasi also has a similar ID structure and table)
				// You might need a findKalibrasiIDByNumericID function and Kalibrasi struct
				// If Kalibrasi data is stored differently, adjust accordingly.
				// For now, if no specific Kalibrasi FK, you might skip or handle differently.
				inventoryID, err := findInventoryIDByNumericID(numericID) // Assuming Kalibrasi might link to Inventory? Or need separate logic?
				if err != nil {
					log.Printf("Error finding Inventory with numeric ID %d (for Kalibrasi?): %v", numericID, err)
				} else {
					newEntry.InventoryID = inventoryID // Example: Linking Kalibrasi code to Inventory ID
				}
			default:
				log.Printf("Unknown department prefix in FrontendID: %s", deptPrefix)
				// Handle unknown prefix if needed
			}
		}
	}
	// *** Akhir Penanganan Foreign Key ***

	// Menggunakan GORM untuk membuat data baru
	if result := db.Create(&newEntry); result.Error != nil {
		log.Printf("Error saat menambahkan entri QC: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan entri Quality Control", "details": result.Error.Error()})
		return
	}

	// Muat ulang entri dengan ID database yang sudah dibuat untuk respons
	var createdEntry QualityControl
	db.First(&createdEntry, newEntry.QcID) // Ambil dengan ID yang sudah diisi oleh GORM

	// Isi field transient FrontendID dan PassRate
	createdEntry.FrontendID = generateFrontendID(&createdEntry)
	calculatePassRate(&createdEntry)

	c.JSON(http.StatusCreated, createdEntry) // Kirim kembali entri yang baru ditambahkan
}

// deleteQualityControl menghapus entri QC dari database
func deleteQualityControl(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Quality Control tidak valid"})
		return
	}

	// Cari entri yang akan dihapus
	var entry QualityControl
	if result := db.First(&entry, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entri Quality Control tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari entri QC dengan ID %d untuk dihapus: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari entri Quality Control", "details": result.Error.Error()})
		}
		return
	}

	// Menggunakan GORM untuk menghapus data
	if result := db.Delete(&entry); result.Error != nil {
		log.Printf("Error saat menghapus entri QC dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus entri Quality Control", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil) // 204 No Content
}

// updateQualityControl memperbarui entri QC di database
func updateQualityControl(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Quality Control tidak valid"})
		return
	}

	var updatedEntry QualityControl
	if err := c.ShouldBindJSON(&updatedEntry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	validDepartments := map[string]bool{
		"Production": true,
		"Overhaul":   true,
		"Rekayasa":   true,
		"Kalibrasi":  true,
	}
	if !validDepartments[updatedEntry.Department] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Department tidak valid"})
		return
	}

	// Validasi sederhana
	if updatedEntry.ProductName == "" || updatedEntry.BatchCode == "" || updatedEntry.Status == "" || updatedEntry.Department == "" || updatedEntry.TestedCount < 0 || updatedEntry.PassedCount < 0 || updatedEntry.QcDate.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (product, batch, status, department, tested, passed, date) wajib diisi dan jumlah tidak boleh negatif"})
		return
	}
	if updatedEntry.PassedCount > updatedEntry.TestedCount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jumlah lulus tidak boleh lebih besar dari jumlah diuji"})
		return
	}

	// Cari entri yang ada berdasarkan ID (primary key)
	var item QualityControl
	// Preload relasi jika Anda ingin memastikan relasi lama tidak hilang saat Save jika tidak diupdate
	// Namun, karena kita akan me-reset dan menugaskan ulang FK, Preload mungkin tidak diperlukan di sini
	// kecuali jika Anda memiliki logika khusus terkait relasi lama.
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entri Quality Control tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari entri QC dengan ID %d untuk diperbarui: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari entri Quality Control", "details": result.Error.Error()})
		}
		return
	}

	// *** Penanganan Foreign Key saat Update berdasarkan FrontendID ***
	// Pertama, reset semua Foreign Key yang ada untuk mencegah data lama tetap terkait
	item.ProduksiID = nil
	item.OverhaulID = nil
	item.RekayasaID = nil
	item.InventoryID = nil

	if updatedEntry.FrontendID != "" {
		deptPrefix, numericID, err := parseFrontendID(updatedEntry.FrontendID)
		if err != nil {
			log.Printf("Error parsing FrontendID '%s' during update: %v", updatedEntry.FrontendID, err)
			// Decide how to handle invalid FrontendID: return error or ignore?
			// For now, we'll log and continue without setting FKs.
		} else {
			switch strings.ToUpper(deptPrefix) {
			case "PRD": // Produksi
				produksiID, err := findProduksiIDByNumericID(numericID)
				if err != nil {
					log.Printf("Error finding Produksi with numeric ID %d during update: %v", numericID, err)
					// Decide how to handle not finding related item
				} else {
					item.ProduksiID = produksiID // Assign found ID (or nil if not found)
				}
			case "OVH": // Overhaul
				overhaulID, err := findOverhaulIDByNumericID(numericID)
				if err != nil {
					log.Printf("Error finding Overhaul with numeric ID %d during update: %v", numericID, err)
				} else {
					item.OverhaulID = overhaulID
				}
			case "RKY": // Rekayasa
				rekayasaID, err := findRekayasaIDByNumericID(numericID)
				if err != nil {
					log.Printf("Error finding Rekayasa with numeric ID %d during update: %v", numericID, err)
				} else {
					item.RekayasaID = rekayasaID
				}
			case "KAL": // Kalibrasi (assuming Kalibrasi might link to Inventory)
				inventoryID, err := findInventoryIDByNumericID(numericID)
				if err != nil {
					log.Printf("Error finding Inventory with numeric ID %d (for Kalibrasi?) during update: %v", numericID, err)
				} else {
					item.InventoryID = inventoryID
				}
			default:
				log.Printf("Unknown department prefix in FrontendID '%s' during update", deptPrefix)
				// Handle unknown prefix if needed
			}
		}
	}
	// *** Akhir Penanganan Foreign Key saat Update ***

	// Update field entri yang ada dengan data dari updatedEntry
	item.ProductName = updatedEntry.ProductName
	item.BatchCode = updatedEntry.BatchCode
	item.Status = updatedEntry.Status
	item.TestedCount = updatedEntry.TestedCount
	item.PassedCount = updatedEntry.PassedCount
	item.QcDate = updatedEntry.QcDate
	item.Department = updatedEntry.Department
	// Foreign Keys (ProduksiID, OverhaulID, RekayasaID, InventoryID) sudah diupdate di blok di atas

	// Menggunakan GORM untuk menyimpan perubahan
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error saat memperbarui entri QC dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui entri Quality Control", "details": result.Error.Error()})
		return
	}

	// Muat ulang entri dengan perubahan untuk respons
	var savedEntry QualityControl
	// Preload relasi jika Anda ingin menyertakan data relasi dalam respons UPDATE
	// db.Preload(...).First(&savedEntry, item.QcID)
	db.First(&savedEntry, item.QcID)

	// Isi field transient FrontendID dan PassRate
	savedEntry.FrontendID = generateFrontendID(&savedEntry)
	calculatePassRate(&savedEntry)

	c.JSON(http.StatusOK, savedEntry) // Kirim kembali entri yang diperbarui
}
func getQualityControlByFrontendID(c *gin.Context) {
	frontendCode := c.Param("frontendCode")
	deptPrefix, numericID, err := parseFrontendID(frontendCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format FrontendID tidak valid", "details": err.Error()})
		return
	}

	var entry QualityControl
	if result := db.Where("qc_id = ? AND department = ?", numericID, getDepartmentFromPrefix(deptPrefix)).First(&entry); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entri QC tidak ditemukan untuk kode tersebut"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data QC", "details": result.Error.Error()})
		}
		return
	}

	entry.FrontendID = generateFrontendID(&entry)
	calculatePassRate(&entry)

	c.JSON(http.StatusOK, entry)
}
func getDepartmentFromPrefix(prefix string) string {
	switch strings.ToUpper(prefix) {
	case "PRD":
		return "Production"
	case "OVH":
		return "Overhaul"
	case "RKY":
		return "Rekayasa"
	case "KAL":
		return "Kalibrasi"
	default:
		return ""
	}
}

var db *gorm.DB

func Init(database *gorm.DB) {
	db = database

}

func RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/", getAllQualityControl)
	rg.GET("/:id", getQualityControlByID)
	rg.POST("/", createQualityControl)
	rg.PUT("/:id", updateQualityControl)
	rg.DELETE("/:id", deleteQualityControl)
}
