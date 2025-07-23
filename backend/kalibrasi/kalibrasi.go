package kalibrasi

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Calibration mewakili struktur data untuk tabel 'calibration'
type Calibration struct {
	CalibrationID int `json:"id" gorm:"column:calibration_id;primaryKey;autoIncrement"`

	ToolName     string    `json:"name" gorm:"column:tool_name"`
	Status       string    `json:"status" gorm:"column:status"`
	ProgressStep int       `json:"progress" gorm:"column:progress_step"` // Progress step (0-5)
	DueDate      time.Time `json:"dueDate" gorm:"column:due_date;type:date"`
	LastUpdate   time.Time `json:"lastUpdate" gorm:"column:last_update"`              // Menggunakan time.Time untuk datetime
	InventoryID  *uint     `json:"inventory_id,omitempty" gorm:"column:inventory_id"` // Tambahkan kembali InventoryID
}

// TableName mengembalikan nama tabel di database untuk model Calibration
func (Calibration) TableName() string {
	return "calibration"
}

var db *gorm.DB // Variabel global untuk instance GORM DB

// Init menginisialisasi modul kalibrasi dengan instance database GORM
func Init(dbInstance *gorm.DB) {
	db = dbInstance
	log.Println("Kalibrasi module initialized.")
	// Opsional: AutoMigrate jika Anda ingin GORM membuat/memperbarui tabel
	// err := db.AutoMigrate(&Calibration{})
	// if err != nil {
	// 	log.Printf("Error auto-migrating Calibration table: %v", err)
	// }
}

// getAllCalibrations mengambil semua item kalibrasi dari database.
func getAllCalibrations(c *gin.Context) {
	var calibrationItems []Calibration
	if result := db.Find(&calibrationItems); result.Error != nil {
		log.Printf("Error fetching all calibration items: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch calibration data", "details": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, calibrationItems)
}

// getCalibrationByID mengambil item kalibrasi berdasarkan ID dari database.
func getCalibrationByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calibration ID"})
		return
	}

	var item Calibration
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Calibration item not found"})
		} else {
			log.Printf("Error fetching calibration item with ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch calibration data", "details": result.Error.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, item)
}

// createCalibration menambahkan item kalibrasi baru ke database.
func createCalibration(c *gin.Context) {
	var newItem Calibration
	if err := c.ShouldBindJSON(&newItem); err != nil {
		log.Printf("Error binding JSON for createCalibration: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}

	// Validasi field yang wajib
	if newItem.ToolName == "" || newItem.Status == "" || newItem.DueDate.IsZero() {
		log.Printf("Validation failed for createCalibration: required fields are empty or invalid date.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fields 'name', 'status', and 'dueDate' are required."})
		return
	}
	// Asumsi max steps 5 (0-4 atau 1-5), sesuaikan jika perlu
	if newItem.ProgressStep < 0 || newItem.ProgressStep > 5 {
		log.Printf("Validation failed for createCalibration: invalid progress step %d.", newItem.ProgressStep)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Progress step must be between 0 and 5."})
		return
	}

	newItem.CalibrationID = 0 // Biarkan GORM mengisi ID jika auto-increment
	newItem.LastUpdate = time.Now()

	log.Printf("Attempting to create calibration item: %+v", newItem)
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error creating calibration item in DB: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create calibration item", "details": result.Error.Error()})
		return
	}
	log.Printf("Successfully created calibration item with ID: %d", newItem.CalibrationID)

	// Muat ulang item yang baru dibuat untuk respons
	var createdItem Calibration
	db.First(&createdItem, newItem.CalibrationID)

	c.JSON(http.StatusCreated, createdItem)
}

// updateCalibration memperbarui item kalibrasi di database.
func updateCalibration(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calibration ID"})
		return
	}

	var updatedItem Calibration
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		log.Printf("Error binding JSON for updateCalibration: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}

	// Validasi field yang wajib
	if updatedItem.ToolName == "" || updatedItem.Status == "" || updatedItem.DueDate.IsZero() {
		log.Printf("Validation failed for updateCalibration: required fields are empty or invalid date.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fields 'name', 'status', and 'dueDate' are required."})
		return
	}
	// Asumsi max steps 5 (0-4 atau 1-5), sesuaikan jika perlu
	if updatedItem.ProgressStep < 0 || updatedItem.ProgressStep > 5 {
		log.Printf("Validation failed for updateCalibration: invalid progress step %d.", updatedItem.ProgressStep)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Progress step must be between 0 and 5."})
		return
	}

	var item Calibration
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Calibration item not found"})
		} else {
			log.Printf("Error fetching calibration item with ID %d for update: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch calibration data", "details": result.Error.Error()})
		}
		return
	}

	// Update fields
	item.ToolName = updatedItem.ToolName
	item.Status = updatedItem.Status
	item.ProgressStep = updatedItem.ProgressStep
	item.DueDate = updatedItem.DueDate
	item.LastUpdate = time.Now()
	item.InventoryID = updatedItem.InventoryID // Update InventoryID

	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error updating calibration item with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update calibration item", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

// deleteCalibration menghapus item kalibrasi dari database.
func deleteCalibration(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calibration ID"})
		return
	}

	if result := db.Delete(&Calibration{}, id); result.Error != nil {
		log.Printf("Error deleting calibration item with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete calibration item", "details": result.Error.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// RegisterRoutes mendaftarkan rute API untuk modul Kalibrasi
func RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/", getAllCalibrations)
	rg.GET("", getAllCalibrations) // <-- INI YANG BENAR
	rg.GET("/:id", getCalibrationByID)
	rg.POST("/", createCalibration)
	rg.POST("", createCalibration)
	rg.PUT("/:id", updateCalibration)
	rg.DELETE("/:id", deleteCalibration)
}
