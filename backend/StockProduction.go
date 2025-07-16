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
	"gorm.io/gorm/clause" // Import clause for eager loading
)

// Struct model sesuai dengan tabel stock_production dan relasi

// InventoryPartial mewakili data Inventory yang relevan untuk relasi stok
// Kita hanya perlu ID dan mungkin Nama Item jika ingin menampilkannya.
type InventoryPartial struct {
	gorm.Model
	InventoryID int    `json:"inventory_id" gorm:"column:inventory_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	Name        string `json:"name" gorm:"column:name"`                            // Contoh jika ingin nama item
}

// ProduksiPartial mewakili data Produksi yang relevan untuk relasi stok
// Kita hanya perlu ID dan mungkin Nama Produksi jika ingin menampilkannya.
type ProduksiPartial struct {
	gorm.Model
	ProduksiID int    `json:"produksi_id" gorm:"column:produksi_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	Name       string `json:"name" gorm:"column:name"`                          // Contoh jika ingin nama produksi
}

// StockProduction mewakili struktur data untuk item stok produksi
type StockProduction struct {
	gorm.Model     // Menyediakan ID (stock_id jika mapping benar), CreatedAt, UpdatedAt, DeletedAt
	StockID    int `json:"id" gorm:"column:stock_id;primaryKey"` // Mapping id frontend ke stock_id

	ItemName   string    `json:"itemName" gorm:"column:item_name"` // Mapping itemName frontend ke item_name
	Quantity   int       `json:"quantity" gorm:"column:quantity"`
	Location   string    `json:"location" gorm:"column:location"`
	Status     string    `json:"status" gorm:"column:status"`
	LastUpdate time.Time `json:"lastUpdate" gorm:"column:last_update"`

	// Foreign Keys ke tabel lain (opsional)
	InventoryID *uint `json:"inventory_id,omitempty" gorm:"column:inventory_id"` // Use pointer for nullable FK
	ProduksiID  *uint `json:"produksi_id,omitempty" gorm:"column:produksi_id"`   // Use pointer for nullable FK

	// Relasi ke objek terkait (jika perlu dimuat)
	Inventory *InventoryPartial `json:"inventory,omitempty"` // Relasi ke InventoryPartial
	Produksi  *ProduksiPartial  `json:"produksi,omitempty"`  // Relasi ke ProduksiPartial

	// Catatan: Jika frontend menggunakan ID string unik (seperti QC), Anda perlu field transient atau kolom di DB.
	// Diasumsikan frontend akan menggunakan ID database (StockID).
}

var db *gorm.DB // Menggunakan GORM DB instance

// initDatabase melakukan koneksi awal ke database menggunakan GORM dan migrasi
func initDatabase() {
	var err error
	// Pastikan detail koneksi sesuai dengan konfigurasi database Anda
	// Ganti "root:@tcp(localhost:3306)/kai_db" jika perlu
	dsn := "root:@tcp(localhost:3306)/kai_balai_yasa?charset=utf8mb4&parseTime=True&loc=Local"
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Gagal koneksi database: %v", err)
	}

	// Membuat tabel stock_production jika belum ada
	err = db.AutoMigrate(&StockProduction{}, &InventoryPartial{}, &ProduksiPartial{}) // Migrasi juga relasi partial jika belum ada
	if err != nil {
		log.Fatalf("Gagal migrasi database untuk StockProduction: %v", err)
	}

	log.Println("Koneksi database dan migrasi StockProduction berhasil!")
}

// getAllStock mengambil semua item stok produksi dari database beserta relasi (jika diperlukan)
func getAllStock(c *gin.Context) {
	var stockItems []StockProduction
	// Menggunakan Preload jika Anda mendefinisikan relasi ke tabel lain
	if result := db.Preload(clause.Associations).Find(&stockItems); result.Error != nil {
		log.Printf("Error saat mengambil data stok produksi: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data Stok Produksi", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, stockItems)
}

// getStockByID mengambil item stok produksi berdasarkan ID database
func getStockByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Stok Produksi tidak valid"})
		return
	}

	var item StockProduction
	// Menggunakan Preload jika diperlukan
	if result := db.Preload(clause.Associations).First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item Stok Produksi tidak ditemukan"})
		} else {
			log.Printf("Error saat mengambil stok produksi dengan ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data Stok Produksi", "details": result.Error.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, item)
}

// createStock menambahkan item stok produksi baru ke database
func createStock(c *gin.Context) {
	var newItem StockProduction
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if newItem.ItemName == "" || newItem.Quantity < 0 || newItem.Location == "" || newItem.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (itemName, quantity, location, status) wajib diisi dan kuantitas tidak boleh negatif"})
		return
	}

	// Jika stock_id di database auto-increment, atur ke 0
	newItem.StockID = 0
	// Set waktu terakhir update
	newItem.LastUpdate = time.Now()

	// *** Penanganan Foreign Key saat Create:
	// Jika frontend mengirimkan ID dari item terkait (misalnya, inventory_id, produksi_id),
	// Anda perlu menugaskan nilai tersebut ke field FK di `newItem`.
	// Contoh: if newItem.InventoryID != nil { ... validasi jika perlu ... }
	// Implementasi penautan ke item terkait memerlukan logika tambahan jika frontend
	// tidak langsung mengirim ID database.

	// Menggunakan GORM untuk membuat data baru
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error saat menambahkan item stok produksi: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan item Stok Produksi", "details": result.Error.Error()})
		return
	}

	// Muat ulang entri dengan ID database yang sudah dibuat untuk respons
	var createdItem StockProduction
	db.Preload(clause.Associations).First(&createdItem, newItem.StockID) // Ambil dengan ID yang sudah diisi oleh GORM

	c.JSON(http.StatusCreated, createdItem) // Kirim kembali item yang baru ditambahkan
}

// updateStock memperbarui item stok produksi di database
func updateStock(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Stok Produksi tidak valid"})
		return
	}

	var updatedItem StockProduction
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if updatedItem.ItemName == "" || updatedItem.Quantity < 0 || updatedItem.Location == "" || updatedItem.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (itemName, quantity, location, status) wajib diisi dan kuantitas tidak boleh negatif"})
		return
	}

	// Cari item yang ada berdasarkan ID (primary key)
	var item StockProduction
	if result := db.Preload(clause.Associations).First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item Stok Produksi tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari item stok produksi dengan ID %d untuk diperbarui: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item Stok Produksi", "details": result.Error.Error()})
		}
		return
	}

	// Update field item yang ada
	item.ItemName = updatedItem.ItemName
	item.Quantity = updatedItem.Quantity
	item.Location = updatedItem.Location
	item.Status = updatedItem.Status
	item.LastUpdate = time.Now() // Update waktu terakhir update

	// Update foreign key jika frontend mengirimkannya
	// item.InventoryID = updatedItem.InventoryID
	// item.ProduksiID = updatedItem.ProduksiID

	// Menggunakan GORM untuk menyimpan perubahan
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error saat memperbarui item stok produksi dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui item Stok Produksi", "details": result.Error.Error()})
		return
	}

	// Muat ulang entri dengan perubahan untuk respons
	var savedItem StockProduction
	db.Preload(clause.Associations).First(&savedItem, item.StockID)

	c.JSON(http.StatusOK, savedItem) // Kirim kembali item yang diperbarui
}

// deleteStock menghapus item stok produksi dari database
func deleteStock(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Stok Produksi tidak valid"})
		return
	}

	// Cari item yang akan dihapus
	var item StockProduction
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item Stok Produksi tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari item stok produksi dengan ID %d untuk dihapus: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item Stok Produksi", "details": result.Error.Error()})
		}
		return
	}

	// Menggunakan GORM untuk menghapus data
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error saat menghapus item stok produksi dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus item Stok Produksi", "details": result.Error.Error()})
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

	// Definisikan endpoint API untuk Stok Produksi
	api := r.Group("/api/stockproduction") // Menggunakan path /api/stockproduction
	{
		api.GET("/", getAllStock)       // GET /api/stockproduction/
		api.GET("/:id", getStockByID)   // GET /api/stockproduction/:id (menggunakan ID database)
		api.POST("/", createStock)      // POST /api/stockproduction/
		api.PUT("/:id", updateStock)    // PUT /api/stockproduction/:id (menggunakan ID database)
		api.DELETE("/:id", deleteStock) // DELETE /api/stockproduction/:id (menggunakan ID database)

		// *** Catatan: Endpoint terpisah mungkin diperlukan untuk:
		// - Menautkan item stok ke Inventory atau Produksi tertentu (jika tidak ditangani di endpoint utama)
		// - Melacak pergerakan stok (masuk/keluar) jika dibutuhkan detail transaksi
	}

	log.Println("Server berjalan di http://localhost:8080")
	log.Fatal(r.Run(":8080")) // Jalankan server
}
