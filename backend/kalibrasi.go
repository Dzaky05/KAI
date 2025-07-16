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

// Struct model sesuai dengan tabel calibration dan relasi

// InventoryPartial mewakili data Inventory yang relevan untuk relasi kalibrasi
// Kita hanya perlu ID dan mungkin Nama Item jika ingin menampilkannya.
type InventoryPartial struct {
	gorm.Model
	InventoryID int    `json:"inventory_id" gorm:"column:inventory_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	Name        string `json:"name" gorm:"column:name"`                            // Contoh jika ingin nama item
}

// Calibration mewakili struktur data untuk item kalibrasi
type Calibration struct {
	gorm.Model        // Menyediakan ID (calibration_id jika mapping benar), CreatedAt, UpdatedAt, DeletedAt
	CalibrationID int `json:"id" gorm:"column:calibration_id;primaryKey"` // Mapping id frontend ke calibration_id

	ToolName     string    `json:"name" gorm:"column:tool_name"` // Mapping name frontend ke tool_name
	Status       string    `json:"status" gorm:"column:status"`
	ProgressStep int       `json:"progress" gorm:"column:progress_step"`     // Mapping progress frontend ke progress_step
	DueDate      time.Time `json:"dueDate" gorm:"column:due_date;type:date"` // Mapping dueDate frontend ke due_date
	LastUpdate   time.Time `json:"lastUpdate" gorm:"column:last_update"`

	// Foreign Key ke tabel inventory (opsional)
	InventoryID *uint `json:"inventory_id,omitempty" gorm:"column:inventory_id"` // Use pointer for nullable FK

	// Relasi ke Inventory (jika perlu dimuat)
	Inventory *InventoryPartial `json:"inventory,omitempty"` // Relasi ke InventoryPartial

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

	// Membuat tabel calibration jika belum ada
	err = db.AutoMigrate(&Calibration{}, &InventoryPartial{}) // Migrasi juga InventoryPartial jika belum ada
	if err != nil {
		log.Fatalf("Gagal migrasi database untuk Calibration: %v", err)
	}

	log.Println("Koneksi database dan migrasi Calibration berhasil!")
}

// getAllCalibrations mengambil semua item kalibrasi dari database beserta relasi (jika diperlukan)
func getAllCalibrations(c *gin.Context) {
	var calibrationItems []Calibration
	// Menggunakan Preload jika Anda mendefinisikan relasi ke tabel lain
	if result := db.Preload(clause.Associations).Find(&calibrationItems); result.Error != nil {
		log.Printf("Error saat mengambil data kalibrasi: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data Kalibrasi", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, calibrationItems)
}

// getCalibrationByID mengambil item kalibrasi berdasarkan ID database
func getCalibrationByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Kalibrasi tidak valid"})
		return
	}

	var item Calibration
	// Menggunakan Preload jika diperlukan
	if result := db.Preload(clause.Associations).First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item Kalibrasi tidak ditemukan"})
		} else {
			log.Printf("Error saat mengambil kalibrasi dengan ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data Kalibrasi", "details": result.Error.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, item)
}

// createCalibration menambahkan item kalibrasi baru ke database
func createCalibration(c *gin.Context) {
	var newItem Calibration
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if newItem.ToolName == "" || newItem.Status == "" || newItem.DueDate.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (name, status, dueDate) wajib diisi"})
		return
	}
	// Set progress awal ke 0 jika status "Belum Dimulai" atau dari input frontend
	if newItem.Status == "Belum Dimulai" {
		newItem.ProgressStep = 0
	}
	// Anda bisa juga menambahkan validasi untuk ProgressStep (misal 0 sampai jumlah steps)

	// Jika calibration_id di database auto-increment, atur ke 0
	newItem.CalibrationID = 0
	// Set waktu terakhir update
	newItem.LastUpdate = time.Now()

	// *** Penanganan Foreign Key saat Create:
	// Jika frontend mengirimkan InventoryID terkait, Anda perlu menugaskannya ke field FK.
	// Contoh: if newItem.InventoryID != nil { ... validasi jika perlu ... }
	// Implementasi penautan ke item terkait memerlukan logika tambahan jika frontend
	// tidak langsung mengirim ID database.

	// Menggunakan GORM untuk membuat data baru
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error saat menambahkan item kalibrasi: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan item Kalibrasi", "details": result.Error.Error()})
		return
	}

	// Muat ulang entri dengan ID database yang sudah dibuat untuk respons
	var createdItem Calibration
	db.Preload(clause.Associations).First(&createdItem, newItem.CalibrationID) // Ambil dengan ID yang sudah diisi oleh GORM

	c.JSON(http.StatusCreated, createdItem) // Kirim kembali item yang baru ditambahkan
}

// updateCalibration memperbarui item kalibrasi di database
func updateCalibration(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Kalibrasi tidak valid"})
		return
	}

	var updatedItem Calibration
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if updatedItem.ToolName == "" || updatedItem.Status == "" || updatedItem.DueDate.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (name, status, dueDate) wajib diisi"})
		return
	}
	// Validasi ProgressStep
	if updatedItem.ProgressStep < 0 || updatedItem.ProgressStep > 5 { // Asumsi max steps 5 (0-4)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Langkah progres tidak valid"})
		return
	}

	// Cari item yang ada berdasarkan ID (primary key)
	var item Calibration
	if result := db.Preload(clause.Associations).First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item Kalibrasi tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari item kalibrasi dengan ID %d untuk diperbarui: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item Kalibrasi", "details": result.Error.Error()})
		}
		return
	}

	// Update field item yang ada
	item.ToolName = updatedItem.ToolName
	item.Status = updatedItem.Status
	item.ProgressStep = updatedItem.ProgressStep
	item.DueDate = updatedItem.DueDate
	item.LastUpdate = time.Now() // Update waktu terakhir update

	// Update foreign key jika frontend mengirimkannya
	// item.InventoryID = updatedItem.InventoryID

	// Menggunakan GORM untuk menyimpan perubahan
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error saat memperbarui item kalibrasi dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui item Kalibrasi", "details": result.Error.Error()})
		return
	}

	// Muat ulang entri dengan perubahan untuk respons
	var savedItem Calibration
	db.Preload(clause.Associations).First(&savedItem, item.CalibrationID)

	c.JSON(http.StatusOK, savedItem) // Kirim kembali item yang diperbarui
}

// deleteCalibration menghapus item kalibrasi dari database
func deleteCalibration(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Kalibrasi tidak valid"})
		return
	}

	// Cari item yang akan dihapus
	var item Calibration
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item Kalibrasi tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari item kalibrasi dengan ID %d untuk dihapus: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item Kalibrasi", "details": result.Error.Error()})
		}
		return
	}

	// Menggunakan GORM untuk menghapus data
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error saat menghapus item kalibrasi dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus item Kalibrasi", "details": result.Error.Error()})
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

	// Definisikan endpoint API untuk Kalibrasi
	api := r.Group("/api/kalibrasi") // Menggunakan path /api/kalibrasi
	{
		api.GET("/", getAllCalibrations)      // GET /api/kalibrasi/
		api.GET("/:id", getCalibrationByID)   // GET /api/kalibrasi/:id (menggunakan ID database)
		api.POST("/", createCalibration)      // POST /api/kalibrasi/
		api.PUT("/:id", updateCalibration)    // PUT /api/kalibrasi/:id (menggunakan ID database)
		api.DELETE("/:id", deleteCalibration) // DELETE /api/kalibrasi/:id (menggunakan ID database)

		// *** Catatan: Endpoint terpisah mungkin diperlukan untuk:
		// - Menautkan item kalibrasi ke Inventory tertentu (jika tidak ditangani di endpoint utama)
		// - Mengupdate progres kalibrasi secara bertahap jika tidak semua data kalibrasi dikirim saat update PUT
	}

	log.Println("Server berjalan di http://localhost:8080")
	log.Fatal(r.Run(":8080")) // Jalankan server
}
