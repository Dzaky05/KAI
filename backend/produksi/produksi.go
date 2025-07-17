package produksi

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Personalia untuk many2many
type Personalia struct {
	PersonaliaID int `gorm:"column:personalia_id"`
}

type Materials struct {
	MaterialsID   int     `json:"materials_id" gorm:"column:materials_id;primaryKey"`
	MaterialsName string  `json:"name" gorm:"column:materials_name"`
	Qty           int     `json:"quantity" gorm:"column:qty"`
	Price         float64 `json:"harga" gorm:"column:price"`
	Satuan        string  `json:"satuan" gorm:"column:satuan"`
	ProduksiID    int     `json:"-" gorm:"column:produksi_id"`
}

type Progress struct {
	ProgressID int    `json:"progress_id" gorm:"column:progress_id;primaryKey"`
	Date       string `json:"date" gorm:"column:date"` // karena VARCHAR di DB
	Completed  int    `json:"completed" gorm:"column:completed"`
	Notes      string `json:"notes" gorm:"column:notes"`
	ProduksiID int    `gorm:"column:produksi_id"`
}

type Inventory struct {
	InventoryID int    `json:"inventory_id" gorm:"column:inventory_id;primaryKey"`
	Name        string `json:"name" gorm:"column:name"`
}

type ProduksiTeam struct {
	ProduksiTeamID int `gorm:"column:produksi_team_id;primaryKey"`
	ProduksiID     int `gorm:"column:produksi_id;index"`
	PersonaliaID   int `gorm:"column:personalia_id;index"`
}

type Produksi struct {
	ProduksiID uint   `json:"id" gorm:"column:produksi_id;primaryKey"`
	Name       string `json:"name"`
	Target     int    `json:"target"`
	Completed  int    `json:"completed"`
	Status     string `json:"status"`
	StartDate  string `json:"startDate"`
	EndDate    string `json:"endDate"`

	InventoryID *int       `json:"inventory_id" gorm:"column:inventory_id;index"`
	Inventory   *Inventory `json:"inventory,omitempty" gorm:"foreignKey:InventoryID;references:InventoryID"`

	Materials []Materials  `json:"materials,omitempty" gorm:"foreignKey:ProduksiID"`
	Progress  []Progress   `json:"progress,omitempty" gorm:"foreignKey:ProduksiID"`
	Personnel []Personalia `json:"personnel,omitempty" gorm:"many2many:produksi_team;joinForeignKey:ProduksiID;joinReferences:PersonaliaID"`
}

var db *gorm.DB

func Init(database *gorm.DB) {
	db = database
}

func getAllProduksi(c *gin.Context) {
	var produksiItems []Produksi
	result := db.Preload("Personnel").Preload("Progress").Preload("Materials").Preload("Inventory").Find(&produksiItems)
	if result.Error != nil {
		log.Printf("Error: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, produksiItems)
}

func getProduksiByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Produksi
	result := db.Preload("Personnel").Preload("Progress").Preload("Materials").Preload("Inventory").First(&item, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

func createProduksi(c *gin.Context) {
	var newItem Produksi
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if newItem.Name == "" || newItem.Target <= 0 || newItem.StartDate == "" || newItem.EndDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Field name, target, startDate, endDate wajib diisi"})
		return
	}

	newItem.ProduksiID = 0

	if result := db.Create(&newItem); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	var createdItem Produksi
	db.Preload("Personnel").Preload("Progress").Preload("Materials").Preload("Inventory").First(&createdItem, newItem.ProduksiID)

	c.JSON(http.StatusCreated, createdItem)
}

func updateProduksi(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var updatedItem Produksi
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updatedItem.Name == "" || updatedItem.Target <= 0 || updatedItem.StartDate == "" || updatedItem.EndDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Field name, target, startDate, endDate wajib diisi"})
		return
	}

	var item Produksi
	if result := db.First(&item, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	item.Name = updatedItem.Name
	item.Target = updatedItem.Target
	item.Completed = updatedItem.Completed
	item.Status = updatedItem.Status
	item.StartDate = updatedItem.StartDate
	item.EndDate = updatedItem.EndDate

	if result := db.Save(&item); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	var savedItem Produksi
	db.Preload("Personnel").Preload("Progress").Preload("Materials").Preload("Inventory").First(&savedItem, item.ProduksiID)

	c.JSON(http.StatusOK, savedItem)
}

func deleteProduksi(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Produksi
	if result := db.Preload("Personnel").Preload("Progress").First(&item, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if result := db.Delete(&item); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/", getAllProduksi)
	rg.GET("/:id", getProduksiByID)
	rg.POST("/", createProduksi)
	rg.PUT("/:id", updateProduksi)
	rg.DELETE("/:id", deleteProduksi)
}
