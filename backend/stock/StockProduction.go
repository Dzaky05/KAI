package stock

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Struktur model sesuai tabel yang ada di database

type Inventory struct {
	InventoryID int    `gorm:"column:inventory_id;primaryKey"`
	Name        string `gorm:"column:name"`
}

type Produksi struct {
	ProduksiID int    `gorm:"column:produksi_id;primaryKey"`
	Name       string `gorm:"column:name"`
}

type StockProduction struct {
	StockID    int       `json:"id" gorm:"column:stock_id;primaryKey"`
	ItemName   string    `json:"itemName" gorm:"column:item_name"`
	Quantity   int       `json:"quantity" gorm:"column:quantity"`
	Location   string    `json:"location" gorm:"column:location"`
	Status     string    `json:"status" gorm:"column:status"`
	LastUpdate time.Time `json:"lastUpdate" gorm:"column:last_update"`

	InventoryID *int `json:"inventory_id,omitempty" gorm:"column:inventory_id"`
	ProduksiID  *int `json:"produksi_id,omitempty" gorm:"column:produksi_id"`

	Inventory *Inventory `json:"inventory,omitempty" gorm:"foreignKey:InventoryID;references:InventoryID"`
	Produksi  *Produksi  `json:"produksi,omitempty" gorm:"foreignKey:ProduksiID;references:ProduksiID"`
}

var db *gorm.DB

func Init(database *gorm.DB) {
	db = database
}

func getAllStock(c *gin.Context) {
	var items []StockProduction
	if err := db.Preload("Inventory").Preload("Produksi").Find(&items).Error; err != nil {
		log.Printf("Gagal mengambil stok: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data stok"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func getStockByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item StockProduction
	if err := db.Preload("Inventory").Preload("Produksi").First(&item, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		}
		return
	}
	c.JSON(http.StatusOK, item)
}

func createStock(c *gin.Context) {
	var input StockProduction
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	if input.ItemName == "" || input.Quantity < 0 || input.Location == "" || input.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Field wajib tidak boleh kosong atau negatif"})
		return
	}

	input.StockID = 0
	input.LastUpdate = time.Now()

	if err := db.Create(&input).Error; err != nil {
		log.Printf("Gagal menambahkan stok: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data"})
		return
	}

	var created StockProduction
	db.Preload("Inventory").Preload("Produksi").First(&created, input.StockID)
	c.JSON(http.StatusCreated, created)
}

func updateStock(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var input StockProduction
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	if input.ItemName == "" || input.Quantity < 0 || input.Location == "" || input.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Field wajib tidak boleh kosong atau negatif"})
		return
	}

	var item StockProduction
	if err := db.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		return
	}

	item.ItemName = input.ItemName
	item.Quantity = input.Quantity
	item.Location = input.Location
	item.Status = input.Status
	item.InventoryID = input.InventoryID
	item.ProduksiID = input.ProduksiID
	item.LastUpdate = time.Now()

	if err := db.Save(&item).Error; err != nil {
		log.Printf("Gagal update stok: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan perubahan"})
		return
	}

	var updated StockProduction
	db.Preload("Inventory").Preload("Produksi").First(&updated, item.StockID)
	c.JSON(http.StatusOK, updated)
}

func deleteStock(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item StockProduction
	if err := db.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		return
	}

	if err := db.Delete(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data"})
		return
	}

	c.Status(http.StatusNoContent)
}

func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/", getAllStock)
	r.GET("/:id", getStockByID)
	r.POST("/", createStock)
	r.PUT("/:id", updateStock)
	r.DELETE("/:id", deleteStock)
}
