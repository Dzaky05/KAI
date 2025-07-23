package profile

import (
	"log"
	"net/http"
	"strconv"

	// "time" // Import time package jika ada field tanggal di Profile (selain join_date di Personalia)

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/clause" // Import clause for eager loading
)

// Struct model sesuai dengan skema database dan kebutuhan frontend

// Education mewakili struktur data pendidikan (partial, jika perlu dimuat)
type Education struct {
	EducationID int    `json:"education_id" gorm:"primaryKey;autoIncrement"`
	Degree      string `json:"degree"`
	University  string `json:"university"`
	Year        string `json:"year"`
}

type Experience struct {
	ExperienceID int    `json:"experience_id" gorm:"column:experience_id;primaryKey;index"`
	Position     string `json:"position" gorm:"column:position"`
	Period       string `json:"period" gorm:"column:period"`
}

// PersonaliaPartial mewakili data Personalia yang relevan untuk Profile (NIP dan Nama jika ada)
// Ini digunakan untuk memuat data Personalia yang terkait dengan Profile

// Profile mewakili struktur data untuk item profile
type Profile struct {
	ProfileID   int    `json:"id" gorm:"column:profile_id;primaryKey;autoIncrement"`
	Email       string `json:"email" gorm:"column:email"`
	Address     string `json:"address" gorm:"column:address"`
	PhoneNumber string `json:"phoneNumber" gorm:"column:phone_number"`

	EducationID  *int `json:"education_id,omitempty" gorm:"column:education_id;type:bigint unsigned;index"`
	ExperienceID *int `json:"experience_id,omitempty" gorm:"column:experience_id;type:bigint unsigned;index"`

	Education  *Education  `gorm:"foreignKey:EducationID;references:EducationID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Experience *Experience `gorm:"foreignKey:ExperienceID;references:ExperienceID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
}

func (Profile) TableName() string {
	return "profile"
}
func (Education) TableName() string {
	return "education"
}
func (Experience) TableName() string {
	return "experience"
}

var db *gorm.DB // Menggunakan GORM DB instance

// initDatabase melakukan koneksi awal ke database menggunakan GORM
func Init(database *gorm.DB) {
	db = database
	// Jangan AutoMigrate karena tabel sudah ada di database
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
			return
		}
		return
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
	if newItem.Email == "" || newItem.Address == "" || newItem.Email == "" { // Perbaiki ini: (newItem.Email == "" || newItem.Address == "" || newItem.PhoneNumber == "")
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

func RegisterRoutes(rg *gin.RouterGroup) {
	api := rg
	api.GET("/", getAllProfiles)
	api.GET("/:id", getProfileByID)
	api.POST("/", createProfile)
	api.PUT("/:id", updateProfile)
	api.DELETE("/:id", deleteProfile)
}
