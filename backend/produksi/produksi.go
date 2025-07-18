package produksi

import (
	"encoding/json" // Import untuk JSON encoding/decoding
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Personalia - Hanya untuk referensi NIP, tidak ada relasi GORM langsung di sini
type Personalia struct {
	PersonaliaID int    `json:"personalia_id" gorm:"column:personalia_id;primaryKey"`
	NIP          string `json:"nip" gorm:"column:nip"`
	Jabatan      string `json:"jabatan" gorm:"column:jabatan"`
	Divisi       string `json:"divisi" gorm:"column:divisi"`
}

// Materials - Struct ini akan digunakan untuk binding JSON dari frontend
// dan kemudian di-encode ke string JSON untuk disimpan di DB.
type Materials struct {
	MaterialsID   int     `json:"id"` // ID ini mungkin tidak digunakan jika disimpan sebagai JSON
	MaterialsName string  `json:"name"`
	Qty           int     `json:"qty"`
	Price         float64 `json:"harga"`
	Satuan        string  `json:"satuan"`
}

// Progress - Struct ini akan digunakan untuk binding JSON dari frontend
// dan kemudian di-encode ke string JSON untuk disimpan di DB.
type Progress struct {
	ProgressID int    `json:"id"` // ID ini mungkin tidak digunakan jika disimpan sebagai JSON
	Date       string `json:"date"`
	Completed  int    `json:"completed"`
	Notes      string `json:"notes"`
}

// Produksi - Model utama untuk tabel 'produksi'
type Produksi struct {
	ProduksiID int    `json:"id" gorm:"column:produksi_id;primaryKey;autoIncrement"`
	Name       string `json:"name"`
	Target     int    `json:"target"`
	Completed  int    `json:"completed"`
	Status     string `json:"status"`
	StartDate  string `json:"startDate"`
	EndDate    string `json:"endDate"`

	// Menyimpan Personnel (array of NIP strings) sebagai JSON string
	PersonnelJSON string `json:"-" gorm:"column:personnel_data;type:text"` // `json:"-"` agar tidak di-bind/marshal otomatis
	// Menyimpan Materials (array of Materials objects) sebagai JSON string
	MaterialsJSON string `json:"-" gorm:"column:materials_data;type:text"` // `json:"-"` agar tidak di-bind/marshal otomatis
	// Menyimpan Progress (array of Progress objects) sebagai JSON string
	ProgressJSON string `json:"-" gorm:"column:progress_data;type:text"` // `json:"-"` agar tidak di-bind/marshal otomatis

	// Field-field ini hanya untuk menerima/mengirim JSON dari/ke frontend
	// `gorm:"-"` memberitahu GORM untuk mengabaikan field ini saat interaksi DB
	PersonnelNIPs []string    `json:"personnel" gorm:"-"`
	MaterialsData []Materials `json:"materials" gorm:"-"`
	ProgressData  []Progress  `json:"progress" gorm:"-"`
}

// Definisikan nama tabel untuk GORM
func (Produksi) TableName() string {
	return "produksi"
}

// Tidak perlu mendefinisikan TableName untuk Personalia, Materials, Progress
// jika mereka hanya digunakan sebagai struct untuk JSON marshalling/unmarshalling
// dan tidak dipetakan langsung ke tabel terpisah oleh GORM dalam konteks ini.
// Namun, jika Anda memiliki tabel terpisah untuk mereka (seperti yang Anda tunjukkan sebelumnya),
// maka definisi TableName mereka tetap diperlukan di package masing-masing.
// Untuk konteks ini, kita hanya fokus pada bagaimana mereka di-handle di Produksi.

var db *gorm.DB

func Init(database *gorm.DB) {
	db = database
	// db.AutoMigrate(&Produksi{}) // Hanya Produksi yang akan di-auto-migrate di sini
	log.Println("Produksi module initialized.")
}

func getAllProduksi(c *gin.Context) {
	var produksiItems []Produksi
	result := db.Find(&produksiItems) // Tidak perlu Preload jika disimpan sebagai JSON string
	if result.Error != nil {
		log.Printf("Error fetching all produksi items: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Unmarshal JSON string kembali ke slice untuk respons frontend
	for i := range produksiItems {
		if produksiItems[i].PersonnelJSON != "" {
			if err := json.Unmarshal([]byte(produksiItems[i].PersonnelJSON), &produksiItems[i].PersonnelNIPs); err != nil {
				log.Printf("Error unmarshalling personnel_data: %v", err)
			}
		}
		if produksiItems[i].MaterialsJSON != "" {
			if err := json.Unmarshal([]byte(produksiItems[i].MaterialsJSON), &produksiItems[i].MaterialsData); err != nil {
				log.Printf("Error unmarshalling materials_data: %v", err)
			}
		}
		if produksiItems[i].ProgressJSON != "" {
			if err := json.Unmarshal([]byte(produksiItems[i].ProgressJSON), &produksiItems[i].ProgressData); err != nil {
				log.Printf("Error unmarshalling progress_data: %v", err)
			}
		}
	}
	c.JSON(http.StatusOK, produksiItems)
}

func getProduksiByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Produksi
	result := db.First(&item, id) // Tidak perlu Preload
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Unmarshal JSON string kembali ke slice untuk respons frontend
	if item.PersonnelJSON != "" {
		if err := json.Unmarshal([]byte(item.PersonnelJSON), &item.PersonnelNIPs); err != nil {
			log.Printf("Error unmarshalling personnel_data for ID %d: %v", id, err)
		}
	}
	if item.MaterialsJSON != "" {
		if err := json.Unmarshal([]byte(item.MaterialsJSON), &item.MaterialsData); err != nil {
			log.Printf("Error unmarshalling materials_data for ID %d: %v", id, err)
		}
	}
	if item.ProgressJSON != "" {
		if err := json.Unmarshal([]byte(item.ProgressJSON), &item.ProgressData); err != nil {
			log.Printf("Error unmarshalling progress_data for ID %d: %v", id, err)
		}
	}

	c.JSON(http.StatusOK, item)
}

func createProduksi(c *gin.Context) {
	var req Produksi // Menggunakan struct Produksi langsung untuk request body
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error binding JSON for createProduksi: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format JSON tidak valid", "details": err.Error()})
		return
	}

	if req.Name == "" || req.Target <= 0 || req.StartDate == "" || req.EndDate == "" {
		log.Printf("Validation failed for createProduksi: %+v", req)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Field name, target, startDate, endDate wajib diisi"})
		return
	}

	// Reset ID untuk auto increment
	req.ProduksiID = 0

	// Marshal PersonnelNIPs ke JSON string
	if len(req.PersonnelNIPs) > 0 {
		personnelBytes, err := json.Marshal(req.PersonnelNIPs)
		if err != nil {
			log.Printf("Error marshalling PersonnelNIPs: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data personel"})
			return
		}
		req.PersonnelJSON = string(personnelBytes)
	}

	// Marshal MaterialsData ke JSON string
	if len(req.MaterialsData) > 0 {
		materialsBytes, err := json.Marshal(req.MaterialsData)
		if err != nil {
			log.Printf("Error marshalling MaterialsData: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data material"})
			return
		}
		req.MaterialsJSON = string(materialsBytes)
	}

	// Marshal ProgressData ke JSON string (jika ada)
	if len(req.ProgressData) > 0 {
		progressBytes, err := json.Marshal(req.ProgressData)
		if err != nil {
			log.Printf("Error marshalling ProgressData: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data progress"})
			return
		}
		req.ProgressJSON = string(progressBytes)
	}

	// Simpan Produksi ke database
	log.Printf("Attempting to create Produksi: %+v", req)
	if err := db.Create(&req).Error; err != nil {
		log.Printf("Error creating Produksi in DB: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data produksi", "details": err.Error()})
		return
	}
	log.Printf("Successfully created Produksi with ID: %d", req.ProduksiID)

	// Muat ulang data yang baru dibuat untuk respons (dan unmarshal kembali JSON string)
	var createdItem Produksi
	db.First(&createdItem, req.ProduksiID) // Ambil dari DB lagi

	// Unmarshal kembali untuk respons agar frontend menerima format aslinya
	if createdItem.PersonnelJSON != "" {
		json.Unmarshal([]byte(createdItem.PersonnelJSON), &createdItem.PersonnelNIPs)
	}
	if createdItem.MaterialsJSON != "" {
		json.Unmarshal([]byte(createdItem.MaterialsJSON), &createdItem.MaterialsData)
	}
	if createdItem.ProgressJSON != "" {
		json.Unmarshal([]byte(createdItem.ProgressJSON), &createdItem.ProgressData)
	}

	c.JSON(http.StatusCreated, createdItem)
}

func updateProduksi(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var updatedItem Produksi
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updatedItem.Name == "" || updatedItem.Target <= 0 || updatedItem.StartDate == "" || updatedItem.EndDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Field name, target, startDate, endDate wajib diisi"})
		return
	}

	var item Produksi
	if result := db.First(&item, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Perbarui field dasar
	item.Name = updatedItem.Name
	item.Target = updatedItem.Target
	item.Completed = updatedItem.Completed
	item.Status = updatedItem.Status
	item.StartDate = updatedItem.StartDate
	item.EndDate = updatedItem.EndDate

	// Marshal PersonnelNIPs ke JSON string untuk update
	if len(updatedItem.PersonnelNIPs) > 0 {
		personnelBytes, err := json.Marshal(updatedItem.PersonnelNIPs)
		if err != nil {
			log.Printf("Error marshalling PersonnelNIPs for update: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data personel untuk update"})
			return
		}
		item.PersonnelJSON = string(personnelBytes)
	} else {
		item.PersonnelJSON = "" // Kosongkan jika tidak ada personel
	}

	// Marshal MaterialsData ke JSON string untuk update
	if len(updatedItem.MaterialsData) > 0 {
		materialsBytes, err := json.Marshal(updatedItem.MaterialsData)
		if err != nil {
			log.Printf("Error marshalling MaterialsData for update: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data material untuk update"})
			return
		}
		item.MaterialsJSON = string(materialsBytes)
	} else {
		item.MaterialsJSON = "" // Kosongkan jika tidak ada material
	}

	// Marshal ProgressData ke JSON string untuk update
	if len(updatedItem.ProgressData) > 0 {
		progressBytes, err := json.Marshal(updatedItem.ProgressData)
		if err != nil {
			log.Printf("Error marshalling ProgressData for update: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses data progress untuk update"})
			return
		}
		item.ProgressJSON = string(progressBytes)
	} else {
		item.ProgressJSON = "" // Kosongkan jika tidak ada progress
	}

	if result := db.Save(&item); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	var savedItem Produksi
	db.First(&savedItem, item.ProduksiID)

	// Unmarshal kembali untuk respons agar frontend menerima format aslinya
	if savedItem.PersonnelJSON != "" {
		json.Unmarshal([]byte(savedItem.PersonnelJSON), &savedItem.PersonnelNIPs)
	}
	if savedItem.MaterialsJSON != "" {
		json.Unmarshal([]byte(savedItem.MaterialsJSON), &savedItem.MaterialsData)
	}
	if savedItem.ProgressJSON != "" {
		json.Unmarshal([]byte(savedItem.ProgressJSON), &savedItem.ProgressData)
	}

	c.JSON(http.StatusOK, savedItem)
}

func deleteProduksi(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var item Produksi
	// Tidak perlu Preload atau Association.Clear() jika relasi disimpan sebagai JSON string.
	// Cukup hapus entri Produksi itu sendiri.
	if result := db.Delete(&item, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("", getAllProduksi)
	rg.GET("/", getAllProduksi)

	rg.GET("/:id", getProduksiByID)

	rg.POST("", createProduksi)
	rg.POST("/", createProduksi)
	rg.PUT("/:id", updateProduksi)
	rg.DELETE("/:id", deleteProduksi)
}
