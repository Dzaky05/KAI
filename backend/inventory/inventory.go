package inventory

import (
	"log" // Tambahkan import log untuk logging yang lebih baik
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var db *gorm.DB

type Inventory struct {
	// Perbaikan di sini:
	// 1. Ubah ID dari uint menjadi int
	// 2. Tambahkan gorm:"column:inventory_id" agar cocok dengan nama kolom di DB
	ID       int    `json:"id" gorm:"column:inventory_id;primaryKey;autoIncrement"`
	Name     string `json:"name"`
	Quantity int    `json:"quantity"`
	Location string `json:"location"`
	Status   string `json:"status"`
	// Perbaikan di sini:
	// Tambahkan gorm:"column:itemCode" agar cocok dengan nama kolom di DB (camelCase)
	ItemCode string `json:"itemCode" gorm:"column:itemCode"`
}

func (Inventory) TableName() string {
	return "inventory"
}

func Init(dbInstance *gorm.DB) {
	db = dbInstance
	log.Println("Inventory module initialized.") // Log inisialisasi
	// Jika skema DB sudah fix dari atasan, jangan gunakan AutoMigrate.
	// Jika belum ada tabel, dan Anda ingin GORM membuatnya, uncomment baris ini:
	// err := db.AutoMigrate(&Inventory{})
	// if err != nil {
	// 	log.Printf("Error auto-migrating Inventory table: %v", err)
	// }
}

// Handler GET /api/inventory/ dan /api/inventory
func getAllInventory(c *gin.Context) {
	var items []Inventory
	log.Println("Attempting to fetch all inventory items.") // Log sebelum fetch
	if err := db.Find(&items).Error; err != nil {
		log.Printf("Error fetching all inventory items: %v", err) // Log error
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data inventory", "details": err.Error()})
		return
	}
	log.Printf("Successfully fetched %d inventory items.", len(items)) // Log sukses
	c.JSON(http.StatusOK, items)
}

// Handler GET /api/inventory/:id
func getInventoryByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid ID for getInventoryByID: %s", idStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Inventory
	log.Printf("Attempting to fetch inventory item with ID: %d", id)
	// GORM akan mencari berdasarkan primary key, yang sekarang sudah benar di-map ke inventory_id
	if err := db.First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("Inventory item with ID %d not found.", id)
			c.JSON(http.StatusNotFound, gin.H{"error": "Item tidak ditemukan"})
		} else {
			log.Printf("Error fetching inventory item with ID %d: %v", id, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data", "details": err.Error()})
		}
		return
	}
	log.Printf("Successfully fetched inventory item: %+v", item)
	c.JSON(http.StatusOK, item)
}

// Handler POST /api/inventory/ dan /api/inventory
func createInventory(c *gin.Context) {
	var item Inventory
	if err := c.ShouldBindJSON(&item); err != nil {
		log.Printf("Error binding JSON for createInventory: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON tidak valid", "details": err.Error()})
		return
	}

	if item.Name == "" || item.Quantity <= 0 || item.Location == "" || item.Status == "" || item.ItemCode == "" {
		log.Printf("Validation failed for createInventory: %+v", item)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field wajib diisi dan quantity harus lebih dari 0"})
		return
	}

	log.Printf("Attempting to create inventory item: %+v", item)
	if err := db.Create(&item).Error; err != nil {
		log.Printf("Error creating inventory item in DB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data", "details": err.Error()})
		return
	}
	log.Printf("Successfully created inventory item with ID: %d", item.ID)
	c.JSON(http.StatusCreated, item)
}

// Handler PUT /api/inventory/:id
func updateInventory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid ID for updateInventory: %s", idStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Inventory
	log.Printf("Attempting to find inventory item for update with ID: %d", id)
	if err := db.First(&item, id).Error; err != nil {
		log.Printf("Inventory item with ID %d not found for update: %v", id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Item tidak ditemukan"})
		return
	}

	var updateData Inventory
	if err := c.ShouldBindJSON(&updateData); err != nil {
		log.Printf("Error binding JSON for updateInventory: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON tidak valid", "details": err.Error()})
		return
	}

	// Update fields
	item.Name = updateData.Name
	item.Quantity = updateData.Quantity
	item.Location = updateData.Location
	item.Status = updateData.Status
	item.ItemCode = updateData.ItemCode // Nama field sudah benar di struct

	log.Printf("Attempting to save updated inventory item ID %d: %+v", id, item)
	if err := db.Save(&item).Error; err != nil {
		log.Printf("Error updating inventory item with ID %d in DB: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update data", "details": err.Error()})
		return
	}
	log.Printf("Successfully updated inventory item ID: %d", item.ID)
	c.JSON(http.StatusOK, item)
}

// Handler DELETE /api/inventory/:id
func deleteInventory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Printf("Invalid ID for deleteInventory: %s", idStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Inventory
	log.Printf("Attempting to find inventory item for deletion with ID: %d", id)
	if err := db.First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			log.Printf("Inventory item with ID %d not found for deletion.", id)
			c.JSON(http.StatusNotFound, gin.H{"error": "Item tidak ditemukan"})
			return
		}
		log.Printf("Error finding inventory item with ID %d for deletion: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari data", "details": err.Error()})
		return
	}

	log.Printf("Attempting to delete inventory item with ID: %d", id)
	if err := db.Delete(&item).Error; err != nil {
		log.Printf("Error deleting inventory item with ID %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data", "details": err.Error()})
		return
	}

	log.Printf("Successfully deleted inventory item with ID: %d", id)
	c.Status(http.StatusNoContent)
}

// Register ke router Gin
func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", getAllInventory)
	r.GET("/", getAllInventory)

	r.GET("/:id", getInventoryByID)

	r.POST("", createInventory)
	r.POST("/", createInventory)

	r.PUT("/:id", updateInventory)
	r.DELETE("/:id", deleteInventory)
}
