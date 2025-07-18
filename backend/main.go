package main

import (
	"fmt"
	"log"
	"time"

	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	// Ganti semua ke format sesuai go module
	"kai-backend/inventory"
	"kai-backend/kalibrasi"
	"kai-backend/overhaul"
	"kai-backend/personalia"
	"kai-backend/produksi"
	"kai-backend/profile"
	"kai-backend/quality"
	"kai-backend/rekayasa"
	"kai-backend/stock"
)

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
			// Verifikasi koneksi ke database yang benar
			db.Raw("SELECT DATABASE()").Scan(&dbName)
			fmt.Printf("✅ Berhasil konek ke database: %s\n", dbName)

			// Cek tabel penting
			if !db.Migrator().HasTable("stock_production") {
				log.Println("⚠️ Tabel stock_production tidak ditemukan")
			}
			return db
		}

		log.Printf("❌ Gagal konek ke database (percobaan %d): %v", i+1, err)
		time.Sleep(5 * time.Second)
	}
	log.Fatal("❌ Gagal konek ke database setelah 10 percobaan.")
	return nil
}
func main() {
	fmt.Println("🚀 Menjalankan semua modul backend...")

	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Gagal memuat file .env")
	}

	// 1. Koneksi Database

	dsn := os.Getenv("DB_DSN")
	db := connectDB(dsn)

	// 2. Inisialisasi Gin
	r := gin.Default()

	// 3. Middleware CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// 4. Inisialisasi & Register Route per Modul
	overhaul.Init(db)
	overhaul.RegisterRoutes(r.Group("/api/overhaul"))

	quality.Init(db)
	quality.RegisterRoutes(r.Group("/api/qc"))

	rekayasa.Init(db)
	rekayasa.RegisterRoutes(r.Group("/api/rekayasa"))

	stock.Init(db)
	stock.RegisterRoutes(r.Group("/api/stock"))

	inventory.Init(db)
	inventory.RegisterRoutes(r.Group("/api/inventory"))

	kalibrasi.Init(db)
	kalibrasi.RegisterRoutes(r.Group("/api/kalibrasi"))

	personalia.Init(db)
	personalia.RegisterRoutes(r.Group("/api/personalia"))

	produksi.Init(db)
	produksi.RegisterRoutes(r.Group("/api/produksi"))

	profile.Init(db)
	profile.RegisterRoutes(r.Group("/api/profile"))

	fmt.Println("✅ Semua route backend terdaftar! Siap menerima request 🚀")
	r.Run(":8080")
}
