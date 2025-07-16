package main

import (
	"log"
	"net/http"
	"strconv"

	// "time" // Import time package jika ada field tanggal di Profile (selain join_date di Personalia)

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/clause" // Import clause for eager loading
)

// Struct model sesuai dengan skema database dan kebutuhan frontend

// Education mewakili struktur data pendidikan (partial, jika perlu dimuat)
type Education struct {
	gorm.Model
	EducationID int    `json:"education_id" gorm:"column:education_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	Degree      string `json:"degree" gorm:"column:degree"`
	University  string `json:"university" gorm:"column:university"`
	Year        string `json:"year" gorm:"column:year"` // Pertimbangkan tipe data int
}

// Experience mewakili struktur data pengalaman (partial, jika perlu dimuat)
type Experience struct {
	gorm.Model
	ExperienceID int    `json:"experience_id" gorm:"column:experience_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	Position     string `json:"position" gorm:"column:position"`
	Period       string `json:"period" gorm:"column:period"`
}

// PersonaliaPartial mewakili data Personalia yang relevan untuk Profile (NIP dan Nama jika ada)
// Ini digunakan untuk memuat data Personalia yang terkait dengan Profile
type PersonaliaPartial struct {
	gorm.Model
	PersonaliaID int    `json:"personalia_id" gorm:"column:personalia_id;primaryKey"`
	NIP          string `json:"nip" gorm:"column:nip"`
	// Asumsi: Nama pegawai ada di tabel Personalia atau terkait erat via Personalia
	// Jika nama ada di tabel Personalia:
	// Name string `json:"name" gorm:"column:nama_kolom_nama_personalia"` // Contoh
}

// Profile mewakili struktur data untuk item profile
type Profile struct {
	gorm.Model         // Menyediakan ID (profile_id jika mapping benar), CreatedAt, UpdatedAt, DeletedAt
	ProfileID   int    `json:"id" gorm:"column:profile_id;primaryKey"` // Mapping id frontend ke profile_id
	Email       string `json:"email" gorm:"column:email"`
	Address     string `json:"address" gorm:"column:addres"`           // Perhatikan typo di skema database (addres vs address)
	PhoneNumber string `json:"phoneNumber" gorm:"column:phone_number"` // Mapping phoneNumber frontend ke phone_number

	EducationID  uint `json:"education_id,omitempty" gorm:"column:education_id"`   // Foreign key
	ExperienceID uint `json:"experience_id,omitempty" gorm:"column:experience_id"` // Foreign key

	// Relasi One-to-One: Profile memiliki satu Education dan satu Experience
	Education  *Education  `json:"education,omitempty" gorm:"foreignKey:EducationID"`   // Menggunakan pointer untuk One-to-One opsional
	Experience *Experience `json:"experience,omitempty" gorm:"foreignKey:ExperienceID"` // Menggunakan pointer untuk One-to-One opsional

	// Relasi One-to-One atau One-to-Many: Satu Profile bisa terkait dengan satu atau banyak Personalia?
	// Berdasarkan frontend (satu NIP per profil), relasi One-to-One (satu Profile untuk satu Personalia) lebih mungkin.
	// Namun, relasi di DB adalah Personalia punya ProfileID.
	// Ini berarti One-to-One (Profile has one Personalia) atau One-to-Many (Profile has many Personalia).
	// Untuk mengambil NIP dan Nama (jika di Personalia), kita bisa menggunakan:
	// Personalia *PersonaliaPartial `json:"personalia,omitempty" gorm:"foreignKey:ProfileID"` // Jika One-to-One Profile has one Personalia
	// ATAU (jika satu Profile bisa terkait dengan banyak Personalia, tapi frontend hanya menampilkan satu):
	Personalials []PersonaliaPartial `json:"personalials,omitempty" gorm:"foreignKey:ProfileID"` // Jika One-to-Many Profile has many Personalials

	// Field untuk Nama dan NIP dari Personalia (diisi saat mengambil data)
	Name string `json:"name" gorm:"-"` // Field transient, tidak ada di tabel Profile
	NIP  string `json:"nip" gorm:"-"`  // Field transient, tidak ada di tabel Profile

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

	// AutoMigrate akan membuat atau memperbarui tabel Profile, Education, Experience
	// Kita juga perlu migrasi Personalia agar relasi bisa dikenali oleh GORM
	err = db.AutoMigrate(&Profile{}, &Education{}, &Experience{}, &PersonaliaPartial{}) // Migrasi juga PersonaliaPartial
	if err != nil {
		log.Fatalf("Gagal migrasi database untuk Profile/relasi: %v", err)
	}

	log.Println("Koneksi database dan migrasi Profile/relasi berhasil!")
}

// getAllProfiles mengambil semua item profile dari database beserta relasi terkait
func getAllProfiles(c *gin.Context) {
	var profiles []Profile
	// Menggunakan Preload untuk memuat relasi Education, Experience, dan Personalia
	// Menggunakan clauses.Preload(clause.Associations) untuk memuat semua asosiasi (termasuk PersonaliaPartial, Education, Experience)
	if result := db.Preload(clause.Associations).Find(&profiles); result.Error != nil {
		log.Printf("Error saat mengambil data profiles: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data profiles", "details": result.Error.Error()})
		return
	}

	// Mengisi field Name dan NIP transient dari data Personalials yang dimuat
	for i := range profiles {
		if len(profiles[i].Personalials) > 0 {
			// Asumsi: Satu Profile terkait dengan setidaknya satu Personalia dan kita ambil yang pertama untuk NIP/Nama
			profiles[i].NIP = profiles[i].Personalials[0].NIP
			// Jika nama ada di PersonaliaPartial, ambil juga:
			// profiles[i].Name = profiles[i].Personalials[0].Name // Contoh
			// Jika nama tidak ada di Personalia, Anda perlu cara lain untuk mendapatkannya
			// Untuk sementara, saya akan mengisi Name dengan placeholder atau mengosongkannya
			profiles[i].Name = "Nama Pegawai (Ambil dari sumber lain)" // Placeholder
		} else {
			profiles[i].NIP = "N/A"
			profiles[i].Name = "Nama Pegawai Tidak Diketahui"
		}
	}

	c.JSON(http.StatusOK, profiles)
}

// getProfileByID mengambil item profile berdasarkan ID beserta relasi terkait
func getProfileByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID profile tidak valid"})
		return
	}

	var item Profile
	// Menggunakan Preload untuk memuat relasi
	if result := db.Preload(clause.Associations).First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Data profile tidak ditemukan"})
		} else {
			log.Printf("Error saat mengambil profile dengan ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data profile", "details": result.Error.Error()})
		}
		return
	}

	// Mengisi field Name dan NIP transient dari data Personalials yang dimuat
	if len(item.Personalials) > 0 {
		item.NIP = item.Personalials[0].NIP
		// Jika nama ada di PersonaliaPartial, ambil juga:
		// item.Name = item.Personalials[0].Name // Contoh
		item.Name = "Nama Pegawai (Ambil dari sumber lain)" // Placeholder
	} else {
		item.NIP = "N/A"
		item.Name = "Nama Pegawai Tidak Diketahui"
	}

	c.JSON(http.StatusOK, item)
}

// createProfile menambahkan item profile baru ke database beserta relasi terkait
func createProfile(c *gin.Context) {
	var newItem Profile
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if newItem.Email == "" || newItem.Address == "" || newItem.PhoneNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (email, address, phoneNumber) wajib diisi"})
		return
	}

	// Jika profile_id di database auto-increment, atur ke 0
	newItem.ProfileID = 0

	// *** Penanganan Relasi Education, Experience, dan Personalia saat Create:
	// Jika frontend mengirim data lengkap untuk Education atau Experience baru:
	// GORM dapat menyimpan relasi One-to-One secara otomatis jika objek Education/Experience lengkap disertakan.
	// Contoh: newItem.Education = &models.Education{Degree: "S1", ...}
	// Namun, skema frontend Anda tidak menyertakan detail Education/Experience saat membuat profil.

	// Jika frontend mengirim ProfileID untuk menautkan ke Personalia yang sudah ada:
	// Ini agak terbalik dari relasi DB (Personalia punya ProfileID).
	// Biasanya, saat membuat Personalia, Anda menautkannya ke Profile.
	// Jika Anda membuat Profile duluan, Anda perlu cara untuk menautkannya ke Personalia nanti.
	// Atau, alur kerjanya adalah membuat Personalia (termasuk menautkannya ke Profile) via endpoint Personalia.

	// Implementasi penautan/pembuatan relasi saat create/update Profile memerlukan logika tambahan
	// sesuai dengan alur kerja frontend dan struktur data yang dikirim.
	// Untuk kesederhanaan, contoh ini hanya menyimpan data Profile utama.

	// Menggunakan GORM untuk membuat data profile (dan relasi One-to-One jika objek lengkap disertakan)
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error saat menambahkan profile: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan item profile", "details": result.Error.Error()})
		return
	}

	// Muat ulang item dengan relasi yang sudah disimpan untuk respons
	var createdItem Profile
	db.Preload(clause.Associations).First(&createdItem, newItem.ProfileID)
	// Isi field transient Name dan NIP
	if len(createdItem.Personalials) > 0 {
		createdItem.NIP = createdItem.Personalials[0].NIP
		createdItem.Name = "Nama Pegawai (Ambil dari sumber lain)" // Placeholder
	} else {
		createdItem.NIP = "N/A"
		createdItem.Name = "Nama Pegawai Tidak Diketahui"
	}

	c.JSON(http.StatusCreated, createdItem) // Kirim kembali item yang baru ditambahkan
}

// updateProfile memperbarui item profile di database beserta relasi terkait
func updateProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID profile tidak valid"})
		return
	}

	var updatedItem Profile
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if updatedItem.Email == "" || updatedItem.Address == "" || updatedItem.PhoneNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (email, address, phoneNumber) wajib diisi"})
		return
	}

	// Cari item yang ada berdasarkan ID (primary key), preload relasi
	var item Profile
	if result := db.Preload(clause.Associations).First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item profile tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari profile dengan ID %d untuk diperbarui: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item profile", "details": result.Error.Error()})
		}
		return
	}

	// Update field dasar item yang ada
	item.Email = updatedItem.Email
	item.Address = updatedItem.Address
	item.PhoneNumber = updatedItem.PhoneNumber
	// Update foreign key jika ada (EducationID, ExperienceID)

	// *** Penanganan Relasi Education, Experience, dan Personalia saat Update:
	// Mengupdate relasi One-to-One (Education, Experience) dari data frontend yang diterima
	// memerlukan logika tambahan. Jika frontend mengirim data lengkap, Anda bisa menggunakan:
	// db.Model(&item).Association("Education").Replace(updatedItem.Education) // Mengganti Education
	// db.Model(&item).Association("Experience").Replace(updatedItem.Experience) // Mengganti Experience

	// Mengupdate relasi ke Personalia (biasanya dikelola dari sisi Personalia).
	// Jika Anda ingin mengubah Personalia yang terkait dengan Profile ini,
	// ini mungkin memerlukan endpoint terpisah atau logika kompleks.

	// Menggunakan GORM untuk menyimpan perubahan pada Profile utama
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error saat memperbarui profile dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui item profile", "details": result.Error.Error()})
		return
	}

	// Muat ulang item dengan relasi untuk respons (jika update relasi dilakukan)
	var savedItem Profile
	db.Preload(clause.Associations).First(&savedItem, item.ProfileID)
	// Isi field transient Name dan NIP
	if len(savedItem.Personalials) > 0 {
		savedItem.NIP = savedItem.Personalials[0].NIP
		savedItem.Name = "Nama Pegawai (Ambil dari sumber lain)" // Placeholder
	} else {
		savedItem.NIP = "N/A"
		savedItem.Name = "Nama Pegawai Tidak Diketahui"
	}

	c.JSON(http.StatusOK, savedItem) // Kirim kembali item yang diperbarui
}

// deleteProfile menghapus item profile dari database
func deleteProfile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID profile tidak valid"})
		return
	}

	// Cari item yang akan dihapus
	var item Profile
	if result := db.Preload(clause.Associations).First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item profile tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari profile dengan ID %d untuk dihapus: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item profile", "details": result.Error.Error()})
		}
		return
	}

	// *** Penanganan Relasi Education, Experience, dan Personalia saat Delete:
	// Menghapus Profile tidak otomatis menghapus Education, Experience, atau menata ulang Personalia terkait.
	// Jika Anda ingin menghapus Education/Experience terkait, Anda perlu melakukannya secara manual
	// atau mengatur OnDelete:Cascade pada foreign key di tabel Profile.
	// Untuk Personalia, Anda perlu memutuskan apa yang terjadi (set ProfileID jadi NULL, hapus Personalia, dll.)

	// Menggunakan GORM untuk menghapus data Profile
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error saat menghapus profile dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus item profile", "details": result.Error.Error()})
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

	// Definisikan endpoint API untuk Profile
	api := r.Group("/api/profile") // Menggunakan path /api/profile
	{
		api.GET("/", getAllProfiles)      // GET /api/profile/
		api.GET("/:id", getProfileByID)   // GET /api/profile/:id
		api.POST("/", createProfile)      // POST /api/profile/
		api.PUT("/:id", updateProfile)    // PUT /api/profile/:id
		api.DELETE("/:id", deleteProfile) // DELETE /api/profile/:id

		// *** Catatan: Endpoint terpisah mungkin diperlukan untuk mengelola:
		// - Data Education dan Experience secara individual
		// - Penautan Profile dengan Personalia (jika tidak dikelola sepenuhnya via endpoint Personalia)
	}

	log.Println("Server berjalan di http://localhost:8080")
	log.Fatal(r.Run(":8080")) // Jalankan server
}
