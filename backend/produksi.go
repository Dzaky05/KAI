package main

import (
	"log"
	"net/http"
	"strconv"
	"time" // Import time package

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// Struct model sesuai dengan skema database dan kebutuhan frontend

// Personalia mewakili struktur data personel (partial, hanya field yang relevan untuk relasi)
// Asumsi: Tabel personalia dikelola di tempat lain, kita hanya merujuknya di sini.
type Personalia struct {
	gorm.Model
	PersonaliaID int `json:"personalia_id" gorm:"column:personalia_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	// Tambahkan field lain jika perlu dimuat, contoh:
	// NIP int `json:"nip" gorm:"column:nip"`
	// Jabatan string `json:"jabatan" gorm:"column:jabatan"`
}

// Materials mewakili struktur data material
type Materials struct {
	gorm.Model
	MaterialsID   int     `json:"materials_id" gorm:"column:materials_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	MaterialsName string  `json:"name" gorm:"column:materials_name"`                  // Mapping name frontend ke materials_name
	Qty           int     `json:"quantity" gorm:"column:qty"`                         // Mapping quantity frontend ke qty
	Price         float64 `json:"harga" gorm:"column:price"`                          // Mapping harga frontend ke price (menggunakan float64)
	Satuan        string  `json:"satuan" gorm:"column:satuan"`
	ProduksiID    uint    `json:"-" gorm:"column:produksi_id"` // foreign key ke Produksi
	// Mapping satuan frontend ke satuan (menggunakan string)
}

// Progress mewakili struktur data progres produksi
type Progress struct {
	gorm.Model
	ProgressID int       `json:"progress_id" gorm:"column:progress_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	Date       time.Time `json:"date" gorm:"column:date;type:varchar(100)"`        // Simpan sebagai string di DB, parse sebagai time.Time di Go
	Completed  int       `json:"completed" gorm:"column:completed"`
	Notes      string    `json:"notes" gorm:"column:notes"`
	ProduksiID uint      `gorm:"column:produksi_id"` // Foreign key ke tabel Produksi
}

// ProduksiTeam adalah tabel pivot untuk relasi Many-to-Many antara Produksi dan Personalia
type ProduksiTeam struct {
	gorm.Model
	ProduksiTeamID int  `gorm:"column:produksi_team_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	ProduksiID     uint `gorm:"column:produksi_id"`
	PersonaliaID   uint `gorm:"column:personalia_id"`
}

// Produksi mewakili struktur data untuk item produksi
type Produksi struct {
	gorm.Model            // Menyediakan ID (produksi_id jika mapping benar), CreatedAt, UpdatedAt, DeletedAt
	ProduksiID  int       `json:"id" gorm:"column:produksi_id;primaryKey"` // Mapping id frontend ke produksi_id
	Name        string    `json:"name" gorm:"column:name"`
	Target      int       `json:"target" gorm:"column:target"`
	Completed   int       `json:"completed" gorm:"column:completed"`
	Status      string    `json:"status" gorm:"column:status"`
	StartDate   time.Time `json:"startDate" gorm:"column:start_date;type:varchar(50)"` // Simpan sebagai string, parse time.Time
	EndDate     time.Time `json:"endDate" gorm:"column:end_date;type:varchar(50)"`     // Simpan sebagai string, parse time.Time
	MaterialsID uint      `json:"materials_id,omitempty" gorm:"column:materials_id"`   // Foreign key ke Materials utama (jika ada, berdasarkan skema)
	ProgressID  uint      `json:"progress_id,omitempty" gorm:"column:progress_id"`     // Foreign key ke Progress utama (jika ada, berdasarkan skema)
	InventoryID uint      `json:"inventory_id,omitempty" gorm:"column:inventory_id"`   // Foreign key ke Inventory utama (jika ada, berdasarkan skema)

	// Relasi One-to-Many: Produksi memiliki banyak Progress
	Progress  []Progress   `json:"progress,omitempty" gorm:"foreignKey:ProduksiID"`
	Personnel []Personalia `json:"personnel,omitempty" gorm:"many2many:produksi_team;joinTable:produksi_team;joinForeignKey:produksi_id;references:personalia_id"`
	Materials []Materials  `json:"materials,omitempty" gorm:"foreignKey:ProduksiID"`
}

var db *gorm.DB // Menggunakan GORM DB instance

// initDatabase melakukan koneksi awal ke database menggunakan GORM
func initDatabase() {
	var err error
	// Pastikan detail koneksi sesuai dengan konfigurasi database Anda
	// Ganti "root:@tcp(localhost:3306)/kai_db" jika perlu
	dsn := "root:@tcp(localhost:3306)/kai_balai_yasa?charset=utf8mb4&parseTime=True&loc=Local"
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Gagal koneksi database: %v", err)
	}

	// AutoMigrate akan membuat atau memperbarui tabel Produksi, Progress, ProduksiTeam
	// GORM akan menangani pembuatan kolom foreign key dan tabel pivot
	err = db.AutoMigrate(&Produksi{}, &Materials{}, &Progress{}, &ProduksiTeam{}, &Personalia{})
	if err != nil {
		log.Fatalf("Gagal migrasi database untuk Produksi, Progress, ProduksiTeam, Personalia: %v", err)
	}

	log.Println("Koneksi database dan migrasi Produksi/relasi berhasil!")
}

// getAllProduksi mengambil semua item produksi dari database beserta relasi terkait
func getAllProduksi(c *gin.Context) {
	var produksiItems []Produksi
	result := db.Preload("Personnel").Preload("Progress").Preload("Materials").Find(&produksiItems)
	if result.Error != nil {
		log.Printf("Error saat mengambil data produksi: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data produksi", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, produksiItems)
}

// getProduksiByID mengambil item produksi berdasarkan ID beserta relasi terkait
func getProduksiByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produksi tidak valid"})
		return
	}

	var item Produksi
	result := db.Preload("Personnel").Preload("Progress").Preload("Materials").First(&item, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Data produksi tidak ditemukan"})
		} else {
			log.Printf("Error saat mengambil produksi dengan ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data produksi", "details": result.Error.Error()})
		}
		return
	}

	// *** Catatan: Seperti getAllProduksi, tidak memuat array Materials dari DB

	c.JSON(http.StatusOK, item)
}

// createProduksi menambahkan item produksi baru ke database beserta relasi terkait
func createProduksi(c *gin.Context) {
	var newItem Produksi
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	if newItem.Name == "" || newItem.Target <= 0 || newItem.StartDate.IsZero() || newItem.EndDate.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (name, target, startDate, endDate) wajib diisi dan target > 0"})
		return
	}

	newItem.ProduksiID = 0

	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error saat menambahkan produksi: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan item produksi", "details": result.Error.Error()})
		return
	}

	var createdItem Produksi
	db.Preload("Personnel").Preload("Progress").Preload("Materials").First(&createdItem, newItem.ProduksiID)

	c.JSON(http.StatusCreated, createdItem)
}

// updateProduksi memperbarui item produksi di database beserta relasi terkait
func updateProduksi(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produksi tidak valid"})
		return
	}

	var updatedItem Produksi
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	if updatedItem.Name == "" || updatedItem.Target <= 0 || updatedItem.StartDate.IsZero() || updatedItem.EndDate.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (name, target, startDate, endDate) wajib diisi dan target > 0"})
		return
	}

	var item Produksi
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item produksi tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari produksi: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item produksi", "details": result.Error.Error()})
		}
		return
	}

	item.Name = updatedItem.Name
	item.Target = updatedItem.Target
	item.Completed = updatedItem.Completed
	item.Status = updatedItem.Status
	item.StartDate = updatedItem.StartDate
	item.EndDate = updatedItem.EndDate

	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error saat memperbarui produksi: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui item produksi", "details": result.Error.Error()})
		return
	}

	var savedItem Produksi
	db.Preload("Personnel").Preload("Progress").Preload("Materials").First(&savedItem, item.ProduksiID)

	c.JSON(http.StatusOK, savedItem)
}

// deleteProduksi menghapus item produksi dari database beserta relasi terkait
func deleteProduksi(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID produksi tidak valid"})
		return
	}

	// Cari item yang akan dihapus
	var item Produksi
	if result := db.Preload("Personnel").Preload("Progress").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item produksi tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari produksi dengan ID %d untuk dihapus: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item produksi", "details": result.Error.Error()})
		}
		return
	}

	// GORM akan menghapus relasi Many-to-Many di tabel pivot ProduksiTeam secara otomatis
	// saat Produksi dihapus.
	// GORM juga akan menghapus record History terkait jika foreign key didefinisikan dengan `OnDelete:cascade` di database
	// atau jika menggunakan metode penghapusan GORM yang tepat.

	// Menggunakan GORM untuk menghapus data Produksi
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error saat menghapus produksi dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus item produksi", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil) // 204 No Content
}

func main() {
	initDatabase() // Panggil fungsi inisialisasi database dan migrasi

	r := gin.Default() // Inisialisasi Gin router

	// Konfigurasi Middleware CORS
	// SESUAIKAN INI UNTUK PRODUCTION!
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true // Izinkan dari semua origin (untuk development)
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Definisikan endpoint API untuk Produksi
	api := r.Group("/api/produksi") // Menggunakan path /api/produksi
	{
		api.GET("/", getAllProduksi)       // GET /api/produksi/
		api.GET("/:id", getProduksiByID)   // GET /api/produksi/:id
		api.POST("/", createProduksi)      // POST /api/produksi/
		api.PUT("/:id", updateProduksi)    // PUT /api/produksi/:id
		api.DELETE("/:id", deleteProduksi) // DELETE /api/produksi/:id

		// *** Catatan: Endpoint terpisah mungkin diperlukan untuk mengelola:
		// - Anggota tim produksi (menambah/menghapus dari ProduksiTeam)
		// - Item material yang digunakan dalam produksi (jika ini bukan relasi One-to-One/Many-to-One utama)
		// - Item progress (menambah progress baru untuk produksi)
	}

	log.Println("Server berjalan di http://localhost:8080")
	log.Fatal(r.Run(":8080")) // Jalankan server
}
