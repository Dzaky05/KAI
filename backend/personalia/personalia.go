package personalia

import (
	"database/sql/driver"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time" // Import time package

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/gorm"
)

type DateOnly struct {
	time.Time
}

// Custom type untuk tanggal saja (YYYY-MM-DD) tanpa waktu
func (d DateOnly) Value() (driver.Value, error) {
	if d.Time.IsZero() {
		return nil, nil
	}
	return d.Time.Format("2006-01-02"), nil
}

func (d *DateOnly) Scan(value interface{}) error {
	if value == nil {
		d.Time = time.Time{}
		return nil
	}

	switch v := value.(type) {
	case time.Time:
		d.Time = v
		return nil
	case []byte:
		t, err := time.Parse("2006-01-02", string(v))
		if err != nil {
			return err
		}
		d.Time = t
		return nil
	case string:
		t, err := time.Parse("2006-01-02", v)
		if err != nil {
			return err
		}
		d.Time = t
		return nil
	default:
		return fmt.Errorf("cannot scan type %T into DateOnly", value)
	}
}

func (d DateOnly) MarshalJSON() ([]byte, error) {
	if d.Time.IsZero() {
		return []byte(`null`), nil
	}
	return []byte(`"` + d.Time.Format("2006-01-02") + `"`), nil
}

// Struct model sesuai dengan skema database dan kebutuhan frontend

// Profile mewakili struktur data profile (partial, hanya field yang relevan untuk relasi dan nama jika ada)
type Profile struct {
	ProfileID    int    `json:"profile_id" gorm:"column:profile_id;primaryKey"`
	Email        string `json:"email" gorm:"column:email"`
	Address      string `json:"address" gorm:"column:address"`
	PhoneNumber  string `json:"phone_number" gorm:"column:phone_number"`
	EducationID  int    `json:"education_id" gorm:"column:education_id"`
	ExperienceID int    `json:"experience_id" gorm:"column:experience_id"`
}

// Personalia mewakili struktur data untuk item personalia
type Personalia struct {
	PersonaliaID int      `gorm:"primaryKey;column:personalia_id"`
	NIP          string   `json:"nip" gorm:"column:nip"` // Menggunakan string untuk NIP
	Jabatan      string   `json:"jabatan" gorm:"column:jabatan"`
	Divisi       string   `json:"divisi" gorm:"column:divisi"`
	Lokasi       string   `json:"lokasi" gorm:"column:lokasi"`
	Status       string   `json:"status" gorm:"column:status"`
	JoinDate     DateOnly `gorm:"column:join_date"`
	PhoneNumber  string   `json:"phoneNumber" gorm:"column:phone_number"`
	UrgentNumber string   `json:"urgentNumber" gorm:"column:urgent_number"` // Mapping urgentNumber frontend ke urgent_number

	ProfileID int `json:"profile_id" gorm:"column:profile_id"` // Foreign key ke tabel Profile

	// Relasi Many-to-One: Personalia dimiliki oleh satu Profile
	// GORM akan menggunakan ProfileID di struct Personalia sebagai foreign key secara default
	Profile Profile `json:"profile,omitempty"` // Embed Profile, omitempty agar tidak ditampilkan jika kosong

	// Jika Anda ingin mendapatkan nama pegawai dari Profile, tambahkan di sini
	// Nama string `json:"name" gorm:"-"` // Contoh field transient (tidak disimpan di DB Personalia)

	// Relasi Many-to-Many (jika personalia adalah bagian dari tim produksi/rekayasa)
	// ProduksiTeam []ProduksiTeam `gorm:"foreignKey:PersonaliaID"` // Jika ingin melihat tim produksi mana personalia ini tergabung
	// RekayasaTeam []RekayasaTeam `gorm:"foreignKey:PersonaliaID"` // Jika ingin melihat tim rekayasa mana personalia ini tergabung
}

var db *gorm.DB // Menggunakan GORM DB instance

// initDatabase melakukan koneksi awal ke database menggunakan GORM
func Init(database *gorm.DB) {
	db = database
}

// getAllPersonalia mengambil semua item personalia dari database beserta profile terkait
func getAllPersonalia(c *gin.Context) {
	var personaliaItems []Personalia
	// Menggunakan Preload("Profile") untuk memuat data profile terkait
	if result := db.Preload("Profile").Find(&personaliaItems); result.Error != nil {
		log.Printf("Error saat mengambil data personalia: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data personalia", "details": result.Error.Error()})
		return
	}

	// *** Catatan: Jika nama pegawai ada di Profile, Anda bisa mengaksesnya via item.Profile.Name
	// Jika nama tidak ada di Profile, Anda perlu memutuskan sumber nama pegawai.

	c.JSON(http.StatusOK, personaliaItems)
}

// getPersonaliaByID mengambil item personalia berdasarkan ID beserta profile terkait
func getPersonaliaByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID personalia tidak valid"})
		return
	}

	var item Personalia
	// Menggunakan Preload("Profile") untuk memuat data profile terkait
	if result := db.Preload("Profile").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Data personalia tidak ditemukan"})
		} else {
			log.Printf("Error saat mengambil personalia dengan ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data personalia", "details": result.Error.Error()})
		}
		return
	}

	// *** Catatan: Jika nama pegawai ada di Profile, Anda bisa mengaksesnya via item.Profile.Name

	c.JSON(http.StatusOK, item)
}

// createPersonalia menambahkan item personalia baru ke database
func createPersonalia(c *gin.Context) {
	var newItem Personalia
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if newItem.NIP == "" || newItem.Jabatan == "" || newItem.Divisi == "" || newItem.Lokasi == "" || newItem.Status == "" || newItem.JoinDate.IsZero() || newItem.PhoneNumber == "" || newItem.UrgentNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field wajib diisi"})
		return
	}

	// Jika personalia_id di database auto-increment, atur ke 0
	newItem.PersonaliaID = 0

	// *** Penanganan Relasi Profile saat Create:
	// Jika Anda ingin membuat record Profile baru bersama dengan Personalia:
	// var newProfile Profile
	// // Isi field newProfile dari data yang diterima dari frontend (misalnya, jika frontend mengirim email, dll.)
	// // newProfile.Email = ...
	// // newProfile.Address = ...
	//
	// // Kaitkan Profile baru dengan Personalia baru
	// newItem.Profile = newProfile
	//
	// Jika Anda ingin menautkan ke record Profile yang sudah ada (misalnya, frontend mengirim ProfileID):
	// if newItem.ProfileID != 0 {
	//     // Pastikan Profile dengan ID ini ada di database
	//     var existingProfile Profile
	//     if result := db.First(&existingProfile, newItem.ProfileID); result.Error != nil {
	//         c.JSON(http.StatusBadRequest, gin.H{"error": "Profile dengan ID yang diberikan tidak ditemukan", "details": result.Error.Error()})
	//         return
	//     }
	//     // GORM akan otomatis menautkan berdasarkan ProfileID
	// } else {
	//      // Jika ProfileID 0 atau tidak diberikan, mungkin perlu penanganan khusus
	//      // Misalnya, buat Profile default atau minta frontend selalu memberikan ProfileID
	// }

	// Untuk kesederhanaan, contoh ini hanya menyimpan data Personalia utama.
	// Implementasi penautan/pembuatan Profile saat create/update memerlukan logika tambahan
	// sesuai dengan alur kerja frontend dan struktur data yang dikirim.

	// Menggunakan GORM untuk membuat data personalia (dan relasi jika Profile lengkap disertakan)
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error saat menambahkan personalia: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan item personalia", "details": result.Error.Error()})
		return
	}

	// Muat ulang item dengan profile yang sudah disimpan untuk respons
	var createdItem Personalia
	db.Preload("Profile").First(&createdItem, newItem.PersonaliaID)

	c.JSON(http.StatusCreated, createdItem) // Kirim kembali item yang baru ditambahkan (termasuk ID dan profile)
}

// updatePersonalia memperbarui item personalia di database
func updatePersonalia(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID personalia tidak valid"})
		return
	}

	var updatedItem Personalia
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if updatedItem.NIP == "" || updatedItem.Jabatan == "" || updatedItem.Divisi == "" || updatedItem.Lokasi == "" || updatedItem.Status == "" || updatedItem.JoinDate.IsZero() || updatedItem.PhoneNumber == "" || updatedItem.UrgentNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field wajib diisi"})
		return
	}

	// Cari item yang ada berdasarkan ID (primary key), preload profile
	var item Personalia
	if result := db.Preload("Profile").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item personalia tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari personalia dengan ID %d untuk diperbarui: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item personalia", "details": result.Error.Error()})
		}
		return
	}

	// Update field dasar item yang ada
	item.NIP = updatedItem.NIP
	item.Jabatan = updatedItem.Jabatan
	item.Divisi = updatedItem.Divisi
	item.Lokasi = updatedItem.Lokasi
	item.Status = updatedItem.Status
	item.JoinDate = updatedItem.JoinDate
	item.PhoneNumber = updatedItem.PhoneNumber
	item.UrgentNumber = updatedItem.UrgentNumber

	// *** Penanganan Relasi Profile saat Update:
	// Jika frontend mengirim data Profile lengkap atau ProfileID baru:
	// - Jika ProfileID berubah: update item.ProfileID = updatedItem.ProfileID dan pastikan Profile baru ada.
	// - Jika data Profile lengkap disertakan dan ID cocok dengan Profile terkait: update field Profile terkait.
	// - Jika data Profile lengkap disertakan dan ID tidak cocok / ProfileID tidak ada: buat Profile baru dan tautkan, atau error.
	// Implementasi ini memerlukan logika tambahan sesuai dengan bagaimana frontend mengelola Profile.

	// Menggunakan GORM untuk menyimpan perubahan pada Personalia utama
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error saat memperbarui personalia dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui item personalia", "details": result.Error.Error()})
		return
	}

	// Muat ulang item dengan profile untuk respons (jika update profile dilakukan)
	var savedItem Personalia
	db.Preload("Profile").First(&savedItem, item.PersonaliaID)

	c.JSON(http.StatusOK, savedItem) // Kirim kembali item yang diperbarui
}

// deletePersonalia menghapus item personalia dari database
func deletePersonalia(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID personalia tidak valid"})
		return
	}

	// Cari item yang akan dihapus
	var item Personalia
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item personalia tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari personalia dengan ID %d untuk dihapus: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item personalia", "details": result.Error.Error()})
		}
		return
	}

	// *** Penanganan Relasi Profile saat Delete:
	// Menghapus Personalia tidak otomatis menghapus Profile terkait.
	// Jika Profile hanya terkait dengan satu Personalia dan Anda ingin menghapusnya juga,
	// Anda perlu menghapus Profile terkait secara manual sebelum menghapus Personalia,
	// atau mengatur OnDelete:Cascade pada foreign key ProfileID di tabel Personalia.

	// Menggunakan GORM untuk menghapus data Personalia
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error saat menghapus personalia dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus item personalia", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil) // 204 No Content
}

// Handler: Assign profile_id ke personalia
// Handler: Assign profile_id ke personalia
func AssignProfileToPersonalia(c *gin.Context) {
	id := c.Param("id")

	var input struct {
		ProfileID *int `json:"profile_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var personalia Personalia
	if err := db.First(&personalia, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data personalia tidak ditemukan"})
		return
	}

	personalia.ProfileID = 0
	if input.ProfileID != nil {
		personalia.ProfileID = *input.ProfileID
	}

	if input.ProfileID != nil {
		var profile Profile
		if err := db.First(&profile, *input.ProfileID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Profile dengan ID tersebut tidak ditemukan"})
			return
		}
	}

	if err := db.Save(&personalia).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate profile_id"})
		return
	}

	c.JSON(http.StatusOK, personalia)
}

func RegisterRoutes(r *gin.RouterGroup) {

	// Konfigurasi CORS hanya sekali saja di main.go
	// jadi di sini TIDAK PERLU pakai r.Use(cors.New(config))

	api := r // ✅ karena prefix sudah diberikan dari main.go

	{
		api.GET("/", getAllPersonalia)
		api.GET("/:id", getPersonaliaByID)
		api.POST("/", createPersonalia)
		api.PUT("/:id", updatePersonalia)
		api.DELETE("/:id", deletePersonalia)
		api.PUT("/:id/assign-profile", AssignProfileToPersonalia)

	}
}
