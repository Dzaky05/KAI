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
// Tanpa relasi InventoryID dan Inventory untuk penyederhanaan.
type Calibration struct {
	CalibrationID int `json:"id" gorm:"column:calibration_id;primaryKey;autoIncrement"`

	ToolName     string    `json:"name" gorm:"column:tool_name"`
	Status       string    `json:"status" gorm:"column:status"`
	ProgressStep int       `json:"progress" gorm:"column:progress_step"` // Progress step (0-5)
	DueDate      time.Time `json:"dueDate" gorm:"column:due_date;type:date"`
	LastUpdate   time.Time `json:"lastUpdate" gorm:"column:last_update"` // Menggunakan time.Time untuk datetime
}

// TableName mengembalikan nama tabel di database untuk model Calibration
func (Calibration) TableName() string {
	return "calibration"
}

var db *gorm.DB // Variabel global untuk instance GORM DB

// Init menginisialisasi modul kalibrasi dengan instance database GORM
func Init(dbInstance *gorm.DB) {
	db = dbInstance
	log.Println("Kalibrasi module initialized (simplified).")
}

// getAllCalibrations mengambil semua item kalibrasi dari database.
// Tidak ada Preload karena tidak ada relasi yang dikelola di sini.
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
// Tidak ada Preload.
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
// Tidak ada penanganan InventoryID.
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

	newItem.CalibrationID = 0
	newItem.LastUpdate = time.Now()

	log.Printf("Attempting to create calibration item: %+v", newItem)
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error creating calibration item in DB: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create calibration item", "details": result.Error.Error()})
		return
	}
	log.Printf("Successfully created calibration item with ID: %d", newItem.CalibrationID)

	// Muat ulang item yang baru dibuat untuk respons (tanpa Preload)
	var createdItem Calibration
	db.First(&createdItem, newItem.CalibrationID)

	c.JSON(http.StatusCreated, createdItem)
}

// updateCalibration memperbarui item kalibrasi di database.
// Tidak ada penanganan InventoryID.
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

	// Cari item yang ada berdasarkan ID
	var item Calibration
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Calibration item not found"})
		} else {
			log.Printf("Error finding calibration item with ID %d for update: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find calibration item", "details": result.Error.Error()})
		}
		return
	}

	// Update field item yang ada dengan data dari updatedItem
	item.ToolName = updatedItem.ToolName
	item.Status = updatedItem.Status
	item.ProgressStep = updatedItem.ProgressStep
	item.DueDate = updatedItem.DueDate
	item.LastUpdate = time.Now() // Perbarui waktu terakhir update

	log.Printf("Attempting to update calibration item ID %d: %+v", id, item)
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error updating calibration item with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update calibration item", "details": result.Error.Error()})
		return
	}
	log.Printf("Successfully updated calibration item ID: %d", item.CalibrationID)

	// Muat ulang item yang sudah diperbarui untuk respons (tanpa Preload)
	var savedItem Calibration
	db.First(&savedItem, item.CalibrationID)

	c.JSON(http.StatusOK, savedItem)
}

// deleteCalibration menghapus item kalibrasi dari database.
func deleteCalibration(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calibration ID"})
		return
	}

	// Cari item yang akan dihapus
	var item Calibration
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Calibration item not found"})
			return
		}
		log.Printf("Error finding calibration item with ID %d for deletion: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find calibration item", "details": result.Error.Error()})
		return
	}

	log.Printf("Attempting to delete calibration item with ID: %d", id)
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error deleting calibration item with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete calibration item", "details": result.Error.Error()})
		return
	}
	log.Printf("Successfully deleted calibration item with ID: %d", id)

	c.Status(http.StatusNoContent)
}

// RegisterRoutes mendaftarkan rute API untuk modul kalibrasi.
func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/", getAllCalibrations)
	r.GET("", getAllCalibrations)

	r.GET("/:id", getCalibrationByID)

	r.POST("/", createCalibration)
	r.POST("", createCalibration)

	r.PUT("/:id", updateCalibration)
	r.DELETE("/:id", deleteCalibration)
}
