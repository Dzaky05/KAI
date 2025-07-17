package overhaul

import (
	"log"
	"net/http"
	"strconv"
	"time" // Import time package

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/gorm"
)

// Struct model sesuai dengan skema database dan kebutuhan frontend

// History mewakili struktur data untuk riwayat overhaul
type History struct {
	HistoryID   int       `json:"id" gorm:"column:history_id;primaryKey"`              // Sesuaikan autoIncrement jika perlu
	Timestamp   time.Time `json:"timestamp" gorm:"column:timestamp;type:varchar(100)"` // Simpan sebagai string di DB, parse sebagai time.Time di Go
	Description string    `json:"description" gorm:"column:description"`
	// Relasi ForeignKey ke tabel Overhaul (jika history_id di overhaul adalah foreign key ke tabel history)
	// Namun, berdasarkan skema, history_id adalah foreign key di tabel Overhaul yang merujuk ke tabel History.
	// Jadi, relasi One-to-One atau One-to-Many dari Overhaul ke History lebih mungkin terjadi
	// atau relasi Many-to-One dari History ke Overhaul.
	// Berdasarkan frontend yang embed history array di Overhaul, relasi One-to-Many (Overhaul memiliki banyak History) lebih sesuai.
	OverhaulID uint `gorm:"column:overhaul_id"` // Foreign key ke tabel Overhaul
}
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
	OverhaulID int       `json:"id" gorm:"column:overhaul_id;primaryKey"`
	Name       string    `json:"name" gorm:"column:name"`
	Location   string    `json:"lokasi" gorm:"column:location"`
	Status     string    `json:"status" gorm:"column:status"`
	Estimate   time.Time `json:"estimasi" gorm:"column:estimate;type:varchar(50)"`
	Progress   int       `json:"progress" gorm:"column:progress"`

	// Foreign Keys
	PersonaliaID int `json:"personalia_id" gorm:"column:personalia_id"`
	MaterialsID  int `json:"materials_id" gorm:"column:materials_id"`
	InventoryID  int `json:"inventory_id" gorm:"column:inventory_id"`

	// Relasi eksplisit
	Personalia Personalia `json:"personalia,omitempty" gorm:"foreignKey:PersonaliaID;references:PersonaliaID"`
	Materials  Materials  `json:"materials,omitempty" gorm:"foreignKey:MaterialsID;references:MaterialsID"`
	Inventory  Inventory  `json:"inventory,omitempty" gorm:"foreignKey:InventoryID;references:InventoryID"`

	// Relasi One-to-Many
	History []History `json:"history,omitempty" gorm:"foreignKey:OverhaulID;constraint:OnDelete:CASCADE"`
}

var db *gorm.DB // Menggunakan GORM DB instance

// initDatabase melakukan koneksi awal ke database menggunakan GORM
func Init(dbInstance *gorm.DB) {
	db = dbInstance

}

// getAllOverhaul mengambil semua item overhaul dari database beserta riwayatnya
func getAllOverhaul(c *gin.Context) {
	var overhaulItems []Overhaul
	// Menggunakan Preload("History") untuk memuat data riwayat terkait
	if result := db.Preload("History").Find(&overhaulItems); result.Error != nil {
		log.Printf("Error saat mengambil data overhaul: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data overhaul", "details": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, overhaulItems)
}

// getOverhaulByID mengambil item overhaul berdasarkan ID beserta riwayatnya
func getOverhaulByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID overhaul tidak valid"})
		return
	}

	var item Overhaul
	// Menggunakan Preload("History") untuk memuat data riwayat terkait
	if result := db.Preload("History").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Data overhaul tidak ditemukan"})
		} else {
			log.Printf("Error saat mengambil overhaul dengan ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data overhaul", "details": result.Error.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, item)
}

// createOverhaul menambahkan item overhaul baru ke database beserta riwayatnya
func createOverhaul(c *gin.Context) {
	var newItem Overhaul
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if newItem.Name == "" || newItem.Location == "" || newItem.Status == "" || newItem.Estimate.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (name, lokasi, status, estimasi) wajib diisi"})
		return
	}

	// Jika overhaul_id di database auto-increment, atur ke 0 agar GORM mengisinya
	newItem.OverhaulID = 0

	// GORM akan menyimpan item Overhaul dan riwayat terkait secara bersamaan
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error saat menambahkan overhaul: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan item overhaul", "details": result.Error.Error()})
		return
	}

	// Muat ulang item dengan riwayat yang sudah disimpan untuk respons
	var createdItem Overhaul
	db.Preload("History").First(&createdItem, newItem.OverhaulID)

	c.JSON(http.StatusCreated, createdItem) // Kirim kembali item yang baru ditambahkan (termasuk ID dan riwayat)
}

// updateOverhaul memperbarui item overhaul di database beserta riwayatnya
func updateOverhaul(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID overhaul tidak valid"})
		return
	}

	var updatedItem Overhaul
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if updatedItem.Name == "" || updatedItem.Location == "" || updatedItem.Status == "" || updatedItem.Estimate.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (name, lokasi, status, estimasi) wajib diisi"})
		return
	}

	// Cari item yang ada berdasarkan ID (primary key)
	var item Overhaul
	if result := db.Preload("History").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item overhaul tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari overhaul dengan ID %d untuk diperbarui: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item overhaul", "details": result.Error.Error()})
		}
		return
	}

	// Update field item yang ada dengan data dari updatedItem
	item.Name = updatedItem.Name
	item.Location = updatedItem.Location
	item.Status = updatedItem.Status
	item.Estimate = updatedItem.Estimate
	item.Progress = updatedItem.Progress
	// Update field lain jika ada (PersonaliaID, MaterialsID, InventoryID)

	// Mengelola relasi History:
	// GORM memiliki cara untuk mengelola relasi Many-to-Many atau One-to-Many saat update.
	// Jika Anda ingin mengganti seluruh daftar riwayat, bisa menggunakan:
	// db.Model(&item).Association("History").Replace(updatedItem.History)
	// Jika Anda ingin menghapus riwayat yang tidak ada di updatedItem.History dan menambahkan yang baru:
	db.Model(&item).Association("History").Clear()                     // Hapus semua riwayat yang terkait saat ini
	db.Model(&item).Association("History").Append(updatedItem.History) // Tambahkan riwayat baru dari updatedItem

	// Perlu diingat bahwa mengelola riwayat seperti ini (mengganti seluruhnya) mungkin tidak ideal
	// jika Anda ingin melacak perubahan riwayat secara individual (misalnya, siapa yang menambahkan/menghapus).
	// Pendekatan yang lebih canggih mungkin melibatkan endpoint terpisah untuk mengelola riwayat per item overhaul.
	// Untuk kesederhanaan sesuai frontend, saya menggunakan pendekatan mengganti seluruh array.

	// Menggunakan GORM untuk menyimpan perubahan (akan menyimpan Overhaul dan relasi History yang dimodifikasi)
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error saat memperbarui overhaul dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui item overhaul", "details": result.Error.Error()})
		return
	}

	// Muat ulang item dengan riwayat yang sudah diperbarui untuk respons
	var savedItem Overhaul
	db.Preload("History").First(&savedItem, item.OverhaulID)

	c.JSON(http.StatusOK, savedItem) // Kirim kembali item yang diperbarui
}

// deleteOverhaul menghapus item overhaul dari database beserta riwayat terkait
func deleteOverhaul(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID overhaul tidak valid"})
		return
	}

	// Cari item yang akan dihapus
	var item Overhaul
	if result := db.Preload("History").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item overhaul tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari overhaul dengan ID %d untuk dihapus: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item overhaul", "details": result.Error.Error()})
		}
		return
	}

	// GORM secara otomatis akan menghapus riwayat terkait jika relasi didefinisikan dengan `OnDelete:cascade`
	// atau jika Anda menggunakan metode penghapusan GORM yang tepat.
	// Alternatif: Hapus riwayat terkait secara manual sebelum menghapus overhaul jika OnDelete tidak disetel.
	// db.Where("overhaul_id = ?", item.OverhaulID).Delete(&History{})

	// Menggunakan GORM untuk menghapus data Overhaul (akan menghapus riwayat terkait jika konfigurasi benar)
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error saat menghapus overhaul dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus item overhaul", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil) // 204 No Content
}
func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/", getAllOverhaul)
	r.GET("/:id", getOverhaulByID)
	r.POST("/", createOverhaul)
	r.PUT("/:id", updateOverhaul)
	r.DELETE("/:id", deleteOverhaul)
}
