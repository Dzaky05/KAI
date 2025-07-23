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
// Ini adalah definisi struct dari package produksi dan overhaul yang relevan
// agar bisa diakses di package quality untuk query database.
type Produksi struct {
	ProduksiID int    `json:"id" gorm:"column:produksi_id;primaryKey;autoIncrement"`
	Name       string `json:"name" gorm:"column:name"`
	Target     int    `json:"target" gorm:"column:target"`
	Completed  int    `json:"completed" gorm:"column:completed"`
	Status     string `json:"status" gorm:"column:status"`
	StartDate  string `json:"startDate" gorm:"column:start_date"`
	EndDate    string `json:"endDate" gorm:"column:end_date"`
	// Tambahkan field lain jika diperlukan dari tabel produksi
}

type Overhaul struct {
	OverhaulID int    `json:"id" gorm:"column:overhaul_id;primaryKey;autoIncrement"`
	Name       string `json:"name" gorm:"column:name"`
	Status     string `json:"status" gorm:"column:status"`
	Estimate   string `json:"estimasi" gorm:"column:estimate"` // Changed to string
	Progress   int    `json:"progress" gorm:"column:progress"`
	// Tambahkan field lain jika diperlukan dari tabel overhaul
}

type Rekayasa struct {
	RekayasaID uint `gorm:"column:rekayasa_id;primaryKey"`
	// Tambahkan field yang relevan dari tabel rekayasa jika ada
	Name   string `gorm:"column:name"`
	Status string `gorm:"column:status"`
	// ... dll
}

type Inventory struct { // Digunakan juga untuk Kalibrasi jika ada relasi
	ID   uint   `gorm:"column:id;primaryKey"` // Assuming 'id' is the primary key column name
	Name string `gorm:"column:name"`
	// ... dll
}

// Struct model sesuai dengan tabel quality_control dan relasi

// QualityControl mewakili struktur data untuk entri QC
type QualityControl struct {
	// gorm.Model // Removed gorm.Model to avoid deleted_at column issue
	ID        uint `gorm:"primaryKey;autoIncrement"` // Manual ID for GORM
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"` // Keep DeletedAt if soft deletes are truly intended and column exists

	QcID        int       `gorm:"column:qc_id;uniqueIndex"`           // Changed to uniqueIndex if QcID is unique for QC entries
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
	// Produksi 	*Produksi 	`json:"produksi,omitempty"` // Asumsi struct Produksi sudah didefinisikan
	// Overhaul 	*Overhaul 	`json:"overhaul,omitempty"` // Asumsi struct Overhaul sudah didefinisikan
	// Rekayasa 	*Rekayasa 	`json:"rekayasa,omitempty"` // Asumsi struct Rekayasa sudah didefinisikan
	// Inventory *Inventory `json:"inventory,omitempty"` // Asumsi struct Inventory sudah didefinisikan

	// Catatan: Frontend menggunakan field `id` (string, e.g., "PRD-001") yang berbeda dengan `qc_id` (int).
	// Saya akan menggunakan `qc_id` sebagai primary key database dan field transient `FrontendID` untuk kode frontend jika perlu.
	FrontendID string `json:"id" gorm:"-"` // Field transient untuk kode frontend, now explicitly json:"id"

	// Field untuk pass rate (dihitung di Go)
	PassRate int `json:"passRate" gorm:"-"` // Field transient
}

func (QualityControl) TableName() string {
	return "quality_control"
}
func (Produksi) TableName() string {
	return "produksi"
}
func (Overhaul) TableName() string {
	return "overhaul"
}
func (Rekayasa) TableName() string {
	return "rekayasa"
}
func (Inventory) TableName() string {
	return "inventory"
}

var db *gorm.DB

func Init(database *gorm.DB) {
	db = database
	log.Println("Quality Control module initialized.")
	// Opsional: AutoMigrate jika Anda ingin GORM membuat/memperbarui tabel
	// err := db.AutoMigrate(&QualityControl{}, &Produksi{}, &Overhaul{}, &Rekayasa{}, &Inventory{})
	// if err != nil {
	// 	log.Printf("Error auto-migrating Quality Control related tables: %v", err)
	// }
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
	// Example assumes mapping numericID to 'produksi_id':
	result := db.Select("produksi_id").First(&produksi, numericID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("error finding Produksi with ID %d: %v", numericID, result.Error)
	}
	id := uint(produksi.ProduksiID) // Convert int to uint
	return &id, nil
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
	id := uint(overhaul.OverhaulID) // Convert int to uint
	return &id, nil
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
	// Use QcID for the numeric part, as it's the primary key for QualityControl
	numericPart := strconv.Itoa(qc.QcID)

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
	return prefix + "-" + numericPart
}

// Helper function to calculate pass rate
func calculatePassRate(qc *QualityControl) {
	if qc.TestedCount > 0 {
		qc.PassRate = int(float64(qc.PassedCount)/float64(qc.TestedCount)*100 + 0.5) // Rounding
	} else {
		qc.PassRate = 0
	}
}

// Helper function to map product names to departments
func mapProductToDepartment(productName string) string {
	lowerProductName := strings.ToLower(productName)
	if strings.Contains(lowerProductName, "overhaul") || strings.Contains(lowerProductName, "point machine") {
		return "Overhaul"
	}
	if strings.Contains(lowerProductName, "radio lokomotif") || strings.Contains(lowerProductName, "way station") || strings.Contains(lowerProductName, "sentranik") {
		return "Production"
	}
	if strings.Contains(lowerProductName, "control panel") || strings.Contains(lowerProductName, "signal system") {
		return "Rekayasa"
	}
	if strings.Contains(lowerProductName, "battery pack") || strings.Contains(lowerProductName, "cable set") || strings.Contains(lowerProductName, "kalibrasi") {
		return "Kalibrasi"
	}
	return "Unknown" // Default if no match
}

// getAllQualityControl mengambil semua entri QC dari database,
// serta menggabungkan dan memformat data dari Produksi dan Overhaul.
func getAllQualityControl(c *gin.Context) {
	var allQCEntries []QualityControl

	// 1. Ambil data dari tabel `quality_control` itu sendiri
	var qcFromDB []QualityControl
	if result := db.Find(&qcFromDB); result.Error != nil {
		log.Printf("Error fetching quality_control entries: %v", result.Error)
		// Lanjutkan meskipun ada error, mungkin data departemen lain masih bisa diambil
	}
	for i := range qcFromDB {
		// For items directly from quality_control table, QcID is their primary key
		// and FrontendID is generated based on it.
		qcFromDB[i].FrontendID = generateFrontendID(&qcFromDB[i])
		calculatePassRate(&qcFromDB[i])
		allQCEntries = append(allQCEntries, qcFromDB[i])
	}

	// 2. Ambil dan format data dari tabel `produksi`
	var produksiItems []Produksi
	if result := db.Find(&produksiItems); result.Error != nil {
		log.Printf("Error fetching produksi items: %v", result.Error)
	} else {
		for _, item := range produksiItems {
			status := item.Status
			if status == "Selesai" {
				status = "Lulus" // Map 'Selesai' to 'Lulus' for QC
			}

			// Determine department based on product name, even if from 'produksi' table
			determinedDepartment := mapProductToDepartment(item.Name)
			if determinedDepartment == "Unknown" {
				determinedDepartment = "Production" // Default to Production if product name doesn't clearly indicate another department
			}

			qcEntry := QualityControl{
				QcID:        item.ProduksiID, // Set QcID with ProduksiID for uniqueness
				ProductName: item.Name,
				BatchCode:   fmt.Sprintf("BATCH-%s-%d", item.StartDate[:4], item.ProduksiID), // Example batch
				Status:      status,
				TestedCount: item.Target,
				PassedCount: item.Completed,
				QcDate:      parseDate(item.EndDate), // Convert string date to time.Time
				Department:  determinedDepartment,
				ProduksiID:  uintPtr(uint(item.ProduksiID)), // Corrected typo here
			}
			qcEntry.FrontendID = fmt.Sprintf("PRD-%d", item.ProduksiID) // Generate frontend ID
			calculatePassRate(&qcEntry)
			allQCEntries = append(allQCEntries, qcEntry)
		}
	}

	// 3. Ambil dan format data dari tabel `overhaul`
	var overhaulItems []Overhaul
	if result := db.Find(&overhaulItems); result.Error != nil {
		log.Printf("Error fetching overhaul items: %v", result.Error)
	} else {
		for _, item := range overhaulItems {
			status := item.Status
			if status == "Selesai" {
				status = "Lulus" // Map 'Selesai' to 'Lulus' for QC
			}

			determinedDepartment := mapProductToDepartment(item.Name)
			if determinedDepartment == "Unknown" {
				determinedDepartment = "Overhaul" // Default to Overhaul if product name doesn't clearly indicate another department
			}

			qcEntry := QualityControl{
				QcID:        item.OverhaulID, // Set QcID with OverhaulID for uniqueness
				ProductName: item.Name,
				BatchCode:   fmt.Sprintf("BATCH-%s-%d", item.Estimate[:4], item.OverhaulID), // Example batch, use string slice
				Status:      status,
				TestedCount: 100, // Assuming 100 as total for progress-based QC
				PassedCount: item.Progress,
				QcDate:      parseDate(item.Estimate), // Parse string date
				Department:  determinedDepartment,
				OverhaulID:  uintPtr(uint(item.OverhaulID)), // Set FK
			}
			qcEntry.FrontendID = fmt.Sprintf("OVH-%d", item.OverhaulID) // Generate frontend ID
			calculatePassRate(&qcEntry)
			allQCEntries = append(allQCEntries, qcEntry)
		}
	}

	// 4. Ambil dan format data dari tabel `rekayasa` (placeholder)
	// Jika Anda memiliki tabel rekayasa, lakukan hal serupa:
	/*
		var rekayasaItems []Rekayasa
		if result := db.Find(&rekayasaItems); result.Error != nil {
			log.Printf("Error fetching rekayasa items: %v", result.Error)
		} else {
			for _, item := range rekayasaItems {
				qcEntry := QualityControl{
					QcID:        int(item.RekayasaID), // If RekayasaID is unique and non-zero
					ProductName: item.Name,
					BatchCode:   "RKY-BATCH", // Sesuaikan
					Status:      item.Status, // Sesuaikan
					TestedCount: 0,           // Sesuaikan
					PassedCount: 0,           // Sesuaikan
					QcDate:      time.Now(),  // Sesuaikan
					Department:  "Rekayasa",
					RekayasaID:  &item.RekayasaID,
				}
				qcEntry.FrontendID = fmt.Sprintf("RKY-%d", item.RekayasaID)
				calculatePassRate(&qcEntry)
				allQCEntries = append(allQCEntries, qcEntry)
			}
		}
	*/

	// 5. Ambil dan format data dari tabel `kalibrasi` (placeholder)
	// Jika Anda memiliki tabel kalibrasi, lakukan hal serupa:
	/*
		var kalibrasiItems []Inventory // Asumsi Kalibrasi terkait dengan Inventory
		if result := db.Where("department = ?", "Kalibrasi").Find(&kalibrasiItems); result.Error != nil { // Contoh filter
			log.Printf("Error fetching kalibrasi items: %v", result.Error)
		} else {
			for _, item := range kalibrasiItems {
				qcEntry := QualityControl{
					QcID:        int(item.ID), // If Inventory.ID is unique and non-zero
					ProductName: item.Name,
					BatchCode:   "KAL-BATCH", // Sesuaikan
					Status:      "Lulus",     // Sesuaikan
					TestedCount: 0,           // Sesuaikan
					PassedCount: 0,           // Sesuaikan
					QcDate:      time.Now(),  // Sesuaikan
					Department:  "Kalibrasi",
					InventoryID: &item.ID,
				}
				qcEntry.FrontendID = fmt.Sprintf("KAL-%d", item.ID)
				calculatePassRate(&qcEntry)
				allQCEntries = append(allQCEntries, qcEntry)
			}
		}
	*/

	c.JSON(http.StatusOK, allQCEntries)
}

// parseDate helper function to parse string date to time.Time
func parseDate(dateStr string) time.Time {
	t, err := time.Parse("2006-01-02", dateStr) // Assuming "YYYY-MM-DD" format
	if err != nil {
		log.Printf("Warning: Could not parse date string '%s': %v", dateStr, err)
		return time.Time{} // Return zero time on error
	}
	return t
}

// uintPtr helper function to return a pointer to a uint
func uintPtr(i uint) *uint {
	return &i
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
					log.Printf("Error finding Inventory with numeric ID %d (for Kalibrasi?): %v", numericID, err)
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

// RegisterRoutes mendaftarkan rute API untuk modul Quality Control
func RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/", getAllQualityControl)
	rg.GET("/:id", getQualityControlByID)
	rg.POST("/", createQualityControl)
	rg.PUT("/:id", updateQualityControl)
	rg.DELETE("/:id", deleteQualityControl)
	rg.GET("/frontend/:frontendCode", getQualityControlByFrontendID) // New endpoint for frontend ID search
}
