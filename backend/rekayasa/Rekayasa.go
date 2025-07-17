package rekayasa

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

// PersonaliaPartial mewakili data Personalia yang relevan untuk relasi tim
// Kita hanya perlu ID dan mungkin field identifikasi seperti NIP atau Nama jika ada di tabel Personalia.
type PersonaliaPartial struct {
	PersonaliaID uint   `json:"personalia_id" gorm:"column:personalia_id;primaryKey;index"`
	NIP          string `json:"nip" gorm:"column:nip"`
}

// RekayasaTeam adalah tabel pivot untuk relasi Many-to-Many antara Rekayasa dan Personalia
type RekayasaTeam struct {
	gorm.Model
	RekayasaTeamID int  `gorm:"column:rekayasa_team_id;primaryKey"` // Sesuaikan autoIncrement jika perlu
	RekayasaID     uint `gorm:"column:rekayasa_id;index"`
	PersonaliaID   uint `gorm:"column:personalia_id;index"`
}

// Rekayasa mewakili struktur data untuk item rekayasa
type Rekayasa struct {
	gorm.Model            // Menyediakan ID (rekayasa_id jika mapping benar), CreatedAt, UpdatedAt, DeletedAt
	RekayasaID int        `json:"id" gorm:"column:rekayasa_id;primaryKey"` // Mapping id frontend ke rekayasa_id
	Name       string     `json:"name" gorm:"column:name"`
	Status     string     `json:"status" gorm:"column:status"`
	TeamText   string     `json:"team_text" gorm:"column:team"`              // Field TEXT "team" di database (mungkin digunakan untuk menyimpan string nama tim?)
	Deadline   *time.Time `json:"deadline" gorm:"column:deadline;type:date"` // Menggunakan pointer untuk tanggal opsional
	Progress   string     `json:"progress_text" gorm:"column:progress"`      // Field VARCHAR "progress" di database (mungkin string deskripsi?)
	// Catatan: Frontend Anda menggunakan 'progress' sebagai int (persentase). Ini tidak sesuai dengan DB skema.
	// Saya akan menggunakan 'ProgressText' untuk mapping ke kolom 'progress' VARCHAR.
	// Jika kolom 'progress' di DB seharusnya INT untuk persentase, skema perlu diperbaiki.
	ProgressPercentage int `json:"progress" gorm:"-"` // Field transient untuk persentase, dihitung/ditentukan di Go

	// Relasi Many-to-Many: Rekayasa memiliki banyak Personalia melalui tabel pivot RekayasaTeam
	// Tag `many2many:rekayasa_team` memberitahu GORM untuk menggunakan tabel pivot tersebut.
	// Tag `joinTable` dan `joinForeignKey`/`references` memberikan detail eksplisit.
	TeamMembers  []PersonaliaPartial `json:"team,omitempty" gorm:"many2many:rekayasa_team;joinTable:rekayasa_team;joinForeignKey:rekayasa_id;references:personalia_id"`
	ProgressText string              `json:"progress_text" gorm:"-"` // untuk diparse ke int
	Team         []string            `json:"team" gorm:"-"`          // untuk menampilkan ke frontend

	// Catatan tentang field 'team' TEXT dan 'progress' VARCHAR di DB vs frontend:
	// Frontend menggunakan `team` sebagai array string (inisial) dan `progress` sebagai integer (persentase).
	// Ini tidak langsung cocok dengan kolom `team` (TEXT) dan `progress` (VARCHAR) di skema database.
	// Saya akan memetakan field `Team` (array string) di frontend ke relasi Many-to-Many `TeamMembers`
	// dan field `progress` (integer) di frontend ke field transient `ProgressPercentage`.
	// Anda perlu memutuskan bagaimana data ini sebenarnya disimpan/direpresentasikan di database Anda.
	// Mungkin kolom 'team' TEXT digunakan untuk deskripsi tim, bukan anggota tim individu.
	// Mungkin kolom 'progress' VARCHAR menyimpan deskripsi progres, bukan persentase.
	// Contoh ini akan mengasumsikan relasi Many-to-Many untuk anggota tim dan menghitung persentase dari field lain jika ada,
	// atau menggunakan field transient jika data persentase tidak disimpan langsung di DB Rekayasa.
	// Berdasarkan kode React, tampaknya `progress` (integer) disimpan per proyek.
	// Saya akan menggunakan field transient `ProgressPercentage` untuk mencocokkan frontend.
	// Kolom `progress` di DB akan dipetakan ke `ProgressText`.
}

var db *gorm.DB

func Init(database *gorm.DB) {
	db = database
}

// calculateProgressPercentage mengasumsikan ada kolom lain di database untuk menghitung progres,
// atau menggunakan field 'ProgressText' jika formatnya numerik, atau sumber lain.
// Karena skema DB hanya memiliki 'progress' VARCHAR, kita akan mengosongkannya di backend
// dan membiarkan frontend menghitung/menampilkannya jika perlu.
// Jika ada kolom INT di DB untuk persentase, kita akan memetakan itu.
// Untuk mencocokkan frontend yang menggunakan 'progress' INT, saya akan tambahkan field transient.
func calculateProgressPercentage(r *Rekayasa) {
	// Logika placeholder: Dalam skema database, field 'progress' adalah VARCHAR.
	// Frontend menggunakannya sebagai integer (persentase).
	// Jika ada kolom INT di DB, kita akan membacanya.
	// Karena tidak ada di skema, kita akan mengisi field transient 'ProgressPercentage' dengan nilai default atau dari sumber lain.
	// Dalam contoh ini, kita hanya mengosongkannya, atau jika ada data di ProgressText yang bisa di-parse
	// (meskipun VARCHAR biasanya bukan untuk nilai numerik ini).
	// Jika ada kolom INT misalnya `completion_percentage` di tabel Rekayasa, kita akan pakai itu.
	// r.ProgressPercentage = r.CompletionPercentage // Contoh jika ada kolom CompletionPercentage INT
	r.ProgressPercentage = 0 // Default
	// Coba parse dari ProgressText jika formatnya numerik (kemungkinan tidak)
	if progressInt, err := strconv.Atoi(r.ProgressText); err == nil {
		r.ProgressPercentage = progressInt
	}
}

// mapTeamMembers to string array for frontend
func mapTeamMembersToFrontend(members []PersonaliaPartial) []string {
	var teamStrings []string
	for _, member := range members {
		// Asumsi: Anda ingin menampilkan NIP atau Nama (jika ada di PersonaliaPartial)
		// Jika nama ada di PersonaliaPartial:
		// teamStrings = append(teamStrings, member.Name) // Contoh
		// Jika hanya NIP:
		teamStrings = append(teamStrings, member.NIP) // Contoh
		// Jika tidak ada nama/NIP di PersonaliaPartial, Anda perlu mendapatkan data Personalia lengkap
		// atau menyimpan inisial/nama di tabel pivot atau tabel Rekayasa itu sendiri.
		// Berdasarkan frontend yang menggunakan inisial (BS, AW), Anda mungkin menyimpan inisial di tabel pivot
		// atau tabel Personalia dan mengambilnya.
		teamStrings = append(teamStrings, "Inisial Anggota") // Placeholder
	}
	return teamStrings
}

// getAllRekayasa mengambil semua item rekayasa dari database beserta anggota tim terkait
func getAllRekayasa(c *gin.Context) {
	var rekayasaItems []Rekayasa
	// Menggunakan Preload("TeamMembers") untuk memuat relasi Many-to-Many Personalia
	if result := db.Preload("TeamMembers").Find(&rekayasaItems); result.Error != nil {
		log.Printf("Error saat mengambil data rekayasa: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data rekayasa", "details": result.Error.Error()})
		return
	}

	// Mengisi field transient ProgressPercentage dan Team (array string)
	for i := range rekayasaItems {
		calculateProgressPercentage(&rekayasaItems[i])                                 // Hitung/isi persentase
		rekayasaItems[i].Team = mapTeamMembersToFrontend(rekayasaItems[i].TeamMembers) // Petakan anggota tim ke array string
	}

	c.JSON(http.StatusOK, rekayasaItems)
}

// getRekayasaByID mengambil item rekayasa berdasarkan ID beserta anggota tim terkait
func getRekayasaByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID rekayasa tidak valid"})
		return
	}

	var item Rekayasa
	// Menggunakan Preload("TeamMembers") untuk memuat relasi Many-to-Many Personalia
	if result := db.Preload("TeamMembers").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Data rekayasa tidak ditemukan"})
		} else {
			log.Printf("Error saat mengambil rekayasa dengan ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data rekayasa", "details": result.Error.Error()})
		}
		return
	}

	// Mengisi field transient ProgressPercentage dan Team (array string)
	calculateProgressPercentage(&item)                     // Hitung/isi persentase
	item.Team = mapTeamMembersToFrontend(item.TeamMembers) // Petakan anggota tim ke array string

	c.JSON(http.StatusOK, item)
}

// createRekayasa menambahkan item rekayasa baru ke database beserta anggota tim terkait
func createRekayasa(c *gin.Context) {
	var newItem Rekayasa
	if err := c.ShouldBindJSON(&newItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if newItem.Name == "" || newItem.Status == "" || newItem.Deadline == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (name, status, deadline) wajib diisi"})
		return
	}

	// Jika rekayasa_id di database auto-increment, atur ke 0
	newItem.RekayasaID = 0

	var teamMembers []PersonaliaPartial
	for _, nip := range newItem.Team {
		var member PersonaliaPartial
		if err := db.Where("nip = ?", nip).First(&member).Error; err == nil {
			teamMembers = append(teamMembers, member)
		}
	}
	newItem.TeamMembers = teamMembers

	// *** Penanganan Relasi Many-to-Many TeamMembers saat Create:
	// Frontend mengirimkan array string `team`. Database menggunakan relasi Many-to-Many ke `personalia`.
	// Anda perlu logika untuk:
	// 1. Mengambil/mencari objek Personalia berdasarkan string (inisial/nama/NIP) dari frontend.
	// 2. Menautkan objek Personalia yang ditemukan ke slice `TeamMembers` di `newItem`.
	// Contoh:
	// var teamMembers []PersonaliaPartial
	// for _, memberIdentifier := range newItem.Team { // Iterasi string dari frontend
	//    // Logika untuk mencari PersonaliaPartial berdasarkan memberIdentifier
	//    var personaliaMember PersonaliaPartial
	//    if result := db.Where("nip = ?", memberIdentifier).First(&personaliaMember); result.Error == nil { // Contoh cari berdasarkan NIP
	//        teamMembers = append(teamMembers, personaliaMember)
	//    }
	// }
	// newItem.TeamMembers = teamMembers // Kaitkan slice PersonaliaPartial dengan newItem
	// GORM akan membuat entri di tabel pivot RekayasaTeam saat Create.

	// Untuk kesederhanaan, contoh ini tidak mengimplementasikan logika pencarian Personalia berdasarkan string frontend.
	// Anda harus melengkapi ini. Jika frontend mengirim array ID Personalia, itu akan lebih mudah.

	// Menggunakan GORM untuk membuat data rekayasa (dan relasi Many-to-Many jika TeamMembers lengkap)
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error saat menambahkan rekayasa: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan item rekayasa", "details": result.Error.Error()})
		return
	}

	// Muat ulang item dengan relasi yang sudah disimpan untuk respons
	var createdItem Rekayasa
	db.Preload("TeamMembers").First(&createdItem, newItem.RekayasaID)
	// Isi field transient ProgressPercentage dan Team (array string)
	calculateProgressPercentage(&createdItem)
	createdItem.Team = mapTeamMembersToFrontend(createdItem.TeamMembers)

	c.JSON(http.StatusCreated, createdItem) // Kirim kembali item yang baru ditambahkan
}

// updateRekayasa memperbarui item rekayasa di database beserta anggota tim terkait
func updateRekayasa(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID rekayasa tidak valid"})
		return
	}

	var updatedItem Rekayasa
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if updatedItem.Name == "" || updatedItem.Status == "" || updatedItem.Deadline == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Semua field (name, status, deadline) wajib diisi"})
		return
	}

	// Cari item yang ada berdasarkan ID (primary key), preload relasi
	var item Rekayasa
	if result := db.Preload("TeamMembers").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item rekayasa tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari rekayasa dengan ID %d untuk diperbarui: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item rekayasa", "details": result.Error.Error()})
		}
		return
	}

	// Update field dasar item yang ada
	item.Name = updatedItem.Name
	item.Status = updatedItem.Status
	item.Deadline = updatedItem.Deadline
	// Update field lain jika ada (TeamText, ProgressText)
	var teamMembers []PersonaliaPartial
	for _, nip := range updatedItem.Team {
		var member PersonaliaPartial
		if err := db.Where("nip = ?", nip).First(&member).Error; err == nil {
			teamMembers = append(teamMembers, member)
		}
	}
	updatedItem.TeamMembers = teamMembers

	// *** Penanganan Relasi Many-to-Many TeamMembers saat Update:
	// Frontend mengirimkan array string `team` baru.
	// Anda perlu logika untuk:
	// 1. Menentukan anggota tim baru berdasarkan array string dari frontend (sama seperti saat create).
	// 2. Menggunakan metode GORM Association untuk mengganti anggota tim yang ada dengan daftar baru.
	// Contoh:
	// var newTeamMembers []PersonaliaPartial
	// // Logika untuk mencari PersonaliaPartial berdasarkan string dari updatedItem.Team
	// // ... mengisi newTeamMembers
	// db.Model(&item).Association("TeamMembers").Replace(newTeamMembers) // Mengganti semua anggota tim

	// Untuk kesederhanaan, contoh ini tidak mengimplementasikan update relasi Many-to-Many Personnel.
	// Anda harus melengkapi ini. Jika frontend mengirim array ID Personalia, itu akan lebih mudah.

	// Menggunakan GORM untuk menyimpan perubahan pada Rekayasa utama
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error saat memperbarui rekayasa dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui item rekayasa", "details": result.Error.Error()})
		return
	}

	// Muat ulang item dengan relasi untuk respons (jika update relasi dilakukan)
	var savedItem Rekayasa
	db.Preload("TeamMembers").First(&savedItem, item.RekayasaID)
	// Isi field transient ProgressPercentage dan Team (array string)
	calculateProgressPercentage(&savedItem)
	savedItem.Team = mapTeamMembersToFrontend(savedItem.TeamMembers)

	c.JSON(http.StatusOK, savedItem) // Kirim kembali item yang diperbarui
}

// deleteRekayasa menghapus item rekayasa dari database
func deleteRekayasa(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID rekayasa tidak valid"})
		return
	}

	// Cari item yang akan dihapus
	var item Rekayasa
	if result := db.Preload("TeamMembers").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item rekayasa tidak ditemukan"})
		} else {
			log.Printf("Error saat mencari rekayasa dengan ID %d untuk dihapus: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mencari item rekayasa", "details": result.Error.Error()})
		}
		return
	}

	// GORM akan menghapus relasi Many-to-Many di tabel pivot RekayasaTeam secara otomatis
	// saat Rekayasa dihapus.

	// Menggunakan GORM untuk menghapus data Rekayasa
	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error saat menghapus rekayasa dengan ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus item rekayasa", "details": result.Error.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil) // 204 No Content
}

func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/", getAllRekayasa)
	r.GET("/:id", getRekayasaByID)
	r.POST("/", createRekayasa)
	r.PUT("/:id", updateRekayasa)
	r.DELETE("/:id", deleteRekayasa)
}
