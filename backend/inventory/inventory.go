package inventory

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var db *gorm.DB

type Inventory struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name"`
	Quantity int    `json:"quantity"`
	Location string `json:"location"`
	Status   string `json:"status"`
	ItemCode string `json:"itemCode"`
}

func Init(dbInstance *gorm.DB) {
	db = dbInstance

}

// Handler GET /api/inventory/
func getAllInventory(c *gin.Context) {
	var items []Inventory
	if err := db.Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data inventory", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

// Handler GET /api/inventory/:id
func getInventoryByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Inventory
	if err := db.First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item tidak ditemukan"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data", "details": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, item)
}

// Handler POST /api/inventory/
func createInventory(c *gin.Context) {
	var item Inventory
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON tidak valid", "details": err.Error()})
		return
	}

	if item.Name == "" || item.Quantity <= 0 || item.Location == "" || item.Status == "" || item.ItemCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field wajib diisi dan quantity harus lebih dari 0"})
		return
	}

	if err := db.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// Handler PUT /api/inventory/:id
func updateInventory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Inventory
	if err := db.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item tidak ditemukan"})
		return
	}

	var updateData Inventory
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON tidak valid", "details": err.Error()})
		return
	}

	item.Name = updateData.Name
	item.Quantity = updateData.Quantity
	item.Location = updateData.Location
	item.Status = updateData.Status
	item.ItemCode = updateData.ItemCode

	if err := db.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update data", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

// Handler DELETE /api/inventory/:id
func deleteInventory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	// 🔍 Cek apakah item ada
	var item Inventory
	if err := db.First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari data", "details": err.Error()})
		return
	}

	// 🗑️ Hapus item jika ditemukan
	if err := db.Delete(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data", "details": err.Error()})
		return
	}

	// ✅ Berhasil dihapus
	c.Status(http.StatusNoContent)
}

// Register ke router Gin
func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/", getAllInventory)
	r.GET("/:id", getInventoryByID)
	r.POST("/", createInventory)
	r.PUT("/:id", updateInventory)
	r.DELETE("/:id", deleteInventory)
}
