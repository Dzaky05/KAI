package overhaul

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Overhaul mewakili struktur data untuk tabel 'overhaul'
type Overhaul struct {
	OverhaulID   int        `json:"id" gorm:"column:overhaul_id;primaryKey;autoIncrement"`
	Name         string     `json:"name" gorm:"column:name"`
	Location     *string    `json:"location,omitempty" gorm:"column:location"`
	Status       string     `json:"status" gorm:"column:status"`
	Estimate     string     `json:"estimate,omitempty" gorm:"column:estimate;type:datetime"`
	Progress     int        `json:"progress" gorm:"column:progress"`
	PersonaliaID *int       `json:"personalia_id,omitempty" gorm:"column:personalia_id"` // UBAH INI KE *int
	MaterialsID  *int       `json:"materials_id,omitempty" gorm:"column:materials_id"`   // UBAH INI KE *int
	HistoryID    *int       `json:"history_id,omitempty" gorm:"column:history_id"`       // UBAH INI KE *int
	InventoryID  *int       `json:"inventory_id,omitempty" gorm:"column:inventory_id"`   // UBAH INI KE *int
	DeletedAt    *time.Time `json:"deleted_at,omitempty" gorm:"column:deleted_at;type:datetime"`
}

// TableName mengembalikan nama tabel di database untuk model Overhaul
func (Overhaul) TableName() string {
	return "overhaul"
}

var db *gorm.DB // Variabel global untuk instance GORM DB

// Init menginisialisasi modul overhaul dengan instance database GORM
func Init(dbInstance *gorm.DB) {
	db = dbInstance
	log.Println("Overhaul module initialized.")
	// Opsional: AutoMigrate jika Anda ingin GORM membuat/memperbarui tabel
	// err := db.AutoMigrate(&Overhaul{})
	// if err != nil {
	// 	log.Printf("Error auto-migrating Overhaul table: %v", err)
	// }
}

// getAllOverhauls mengambil semua item overhaul dari database.
func getAllOverhauls(c *gin.Context) {
	var overhaulItems []Overhaul
	if result := db.Where("deleted_at IS NULL").Find(&overhaulItems); result.Error != nil {
		log.Printf("Error fetching all overhaul items: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overhaul data", "details": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, overhaulItems)
}

// getOverhaulByID mengambil item overhaul berdasarkan ID dari database.
func getOverhaulByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid overhaul ID"})
		return
	}

	var item Overhaul
	if result := db.Where("deleted_at IS NULL").First(&item, id); result.Error != nil {
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

// createOverhaul menambahkan item overhaul baru ke database.
func createOverhaul(c *gin.Context) {
	var newItem Overhaul
	if err := c.ShouldBindJSON(&newItem); err != nil {
		log.Printf("Error binding JSON for createOverhaul: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}

	if newItem.Name == "" || newItem.Status == "" {
		log.Printf("Validation failed for createOverhaul: required fields are empty.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fields 'name' and 'status' are required."})
		return
	}

	// Atur nilai default jika tidak disediakan atau tidak valid
	if newItem.Progress < 0 || newItem.Progress > 100 {
		newItem.Progress = 0 // Default progress 0%
	}
	if newItem.Status == "" {
		newItem.Status = "Belum Dimulai" // Default status
	}
	// Karena PersonaliaID, MaterialsID, HistoryID, InventoryID sekarang *int,
	// jika tidak ada di JSON, nilainya akan menjadi nil, yang akan disimpan sebagai NULL di DB.
	// Jika ada di JSON dan nilainya 0, ia akan menjadi pointer ke 0.
	// Kunci sekarang adalah memastikan frontend TIDAK mengirimkan 0 jika memang tidak ada relasi.

	newItem.OverhaulID = 0 // Biarkan GORM mengisi ID jika auto-increment

	log.Printf("Attempting to create overhaul item: %+v", newItem)
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error creating overhaul item in DB: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create overhaul item", "details": result.Error.Error()})
		return
	}
	log.Printf("Successfully created overhaul item with ID: %d", newItem.OverhaulID)

	var createdItem Overhaul
	db.First(&createdItem, newItem.OverhaulID)

	c.JSON(http.StatusCreated, createdItem)
}

// updateOverhaul memperbarui item overhaul di database.
func updateOverhaul(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid overhaul ID"})
		return
	}

	var updatedItem Overhaul
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		log.Printf("Error binding JSON for updateOverhaul: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}

	if updatedItem.Name == "" || updatedItem.Status == "" {
		log.Printf("Validation failed for updateOverhaul: required fields are empty.")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fields 'name' and 'status' are required."})
		return
	}
	if updatedItem.Progress < 0 || updatedItem.Progress > 100 { // Progress 0-100%
		log.Printf("Validation failed for updateOverhaul: invalid progress %d.", updatedItem.Progress)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Progress must be between 0 and 100."})
		return
	}

	var item Overhaul
	if result := db.Where("deleted_at IS NULL").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Overhaul item not found"})
		} else {
			log.Printf("Error fetching overhaul item with ID %d for update: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overhaul data", "details": result.Error.Error()})
		}
		return
	}

	// Update fields (ini akan bekerja dengan *int)
	item.Name = updatedItem.Name
	item.Location = updatedItem.Location
	item.Status = updatedItem.Status
	item.Estimate = updatedItem.Estimate
	item.Progress = updatedItem.Progress
	item.PersonaliaID = updatedItem.PersonaliaID
	item.MaterialsID = updatedItem.MaterialsID
	item.HistoryID = updatedItem.HistoryID
	item.InventoryID = updatedItem.InventoryID

	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error updating overhaul item with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update overhaul item", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

// deleteOverhaul menghapus item overhaul dari database (soft delete)
func deleteOverhaul(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid overhaul ID"})
		return
	}

	var item Overhaul
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Overhaul item not found"})
		} else {
			log.Printf("Error fetching overhaul item with ID %d for deletion: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overhaul data", "details": result.Error.Error()})
		}
		return
	}

	now := time.Now()
	item.DeletedAt = &now
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error soft deleting overhaul item with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete overhaul item", "details": result.Error.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

// RegisterRoutes mendaftarkan rute API untuk modul Overhaul
func RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/", getAllOverhauls)
	rg.GET("", getAllOverhauls) // Untuk menangani /api/overhaul tanpa trailing slash
	rg.GET("/:id", getOverhaulByID)
	rg.POST("/", createOverhaul) // Sudah ada, ini untuk /api/overhaul/
	rg.POST("", createOverhaul)  // <<< Ini yang ditambahkan untuk /api/overhaul
	rg.PUT("/:id", updateOverhaul)
	rg.PUT("", updateOverhaul)
	rg.DELETE("/:id", deleteOverhaul)
}
