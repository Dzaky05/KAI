package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"kai-backend/inventory"
	"kai-backend/kalibrasi"
	"kai-backend/overhaul" // Modul overhaul Anda
	"kai-backend/personalia"
	"kai-backend/produksi"
	"kai-backend/profile"
	"kai-backend/quality"
	"kai-backend/rekayasa"
	"kai-backend/stock"
)

// connectDB mencoba terhubung ke database dengan beberapa percobaan
func connectDB(dsn string) *gorm.DB {
	var db *gorm.DB
	var err error
	var dbName string

	for i := 0; i < 10; i++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			SkipDefaultTransaction:                   true,
			DisableForeignKeyConstraintWhenMigrating: true,
		})

		if err == nil {
			db.Raw("SELECT DATABASE()").Scan(&dbName)
			fmt.Printf("✅ Berhasil konek ke database: %s\n", dbName)

			if !db.Migrator().HasTable("stock_production") {
				log.Println("⚠️ Tabel 'stock_production' tidak ditemukan. Pastikan migrasi database sudah dijalankan.")
			}
			return db
		}

		log.Printf("❌ Gagal konek ke database (percobaan %d): %v", i+1, err)
		time.Sleep(5 * time.Second)
	}
	log.Fatal("❌ Gagal konek ke database setelah 10 percobaan. Aplikasi berhenti.")
	return nil
}

func main() {
	fmt.Println("🚀 Menjalankan semua modul backend...")

	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Gagal memuat file .env. Pastikan ada file .env di root project.")
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("DB_DSN environment variable tidak diatur di .env")
	}
	db := connectDB(dsn)

	// Inisialisasi Gin router
	// Menggunakan gin.ReleaseMode() atau gin.SetMode(gin.ReleaseMode) jika ingin mode produksi
	r := gin.Default()

	// Opsional: Nonaktifkan redirect untuk trailing slashes
	// Ini bisa membantu mengatasi error 307
	r.RedirectTrailingSlash = false
	r.RedirectFixedPath = false

	// Konfigurasi dan Terapkan Middleware CORS
	// Pastikan ini diterapkan SEBELUM rute-rute API Anda
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"} // URL frontend React Anda
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	// Tambahkan "Content-Type" dan "Authorization" jika frontend Anda menggunakannya
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	// *** PENTING: Ubah AllowCredentials menjadi true jika frontend mengirim cookie/header Auth ***
	config.AllowCredentials = true // <-- UBAH KE TRUE
	config.MaxAge = 12 * time.Hour

	r.Use(cors.New(config))

	// Inisialisasi dan Daftarkan Route untuk Setiap Modul API
	api := r.Group("/api")
	{
		overhaul.Init(db)
		overhaul.RegisterRoutes(api.Group("/overhaul")) // Pastikan ini benar

		quality.Init(db)
		quality.RegisterRoutes(api.Group("/qc"))

		rekayasa.Init(db)
		rekayasa.RegisterRoutes(api.Group("/rekayasa"))

		stock.Init(db)
		stock.RegisterRoutes(api.Group("/stock"))

		inventory.Init(db)
		inventory.RegisterRoutes(api.Group("/inventory"))

		kalibrasi.Init(db)
		kalibrasi.RegisterRoutes(api.Group("/kalibrasi"))

		personalia.Init(db)
		personalia.RegisterRoutes(api.Group("/personalia"))

		produksi.Init(db)
		produksi.RegisterRoutes(api.Group("/produksi"))

		profile.Init(db)
		profile.RegisterRoutes(api.Group("/profile"))
	}

	fmt.Println("✅ Semua route backend terdaftar! Siap menerima request 🚀")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server mulai mendengarkan di port: %s\n", port)
	log.Fatal(r.Run(fmt.Sprintf(":%s", port)))
}
