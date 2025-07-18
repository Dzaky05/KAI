package personalia

import (
	"database/sql/driver"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	// Import untuk Excel
	"github.com/xuri/excelize/v2"
	// Import untuk PDF
	"github.com/jung-kurt/gofpdf"
)

// DateOnly struct dan metode-metodenya sudah benar,
// tetapi perhatikan bahwa di struct Personalia, Anda menggunakan `string` untuk JoinDate,
// bukan tipe `DateOnly` ini. Ini tidak masalah selama konsisten.
type DateOnly struct {
	time.Time
}

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

// Struct Profile
type Profile struct {
	ProfileID    int    `json:"profile_id" gorm:"column:profile_id;primaryKey"`
	Email        string `json:"email" gorm:"column:email"`
	Address      string `json:"address" gorm:"column:address"`
	PhoneNumber  string `json:"phone_number" gorm:"column:phone_number"`
	EducationID  int    `json:"education_id" gorm:"column:education_id"`
	ExperienceID int    `json:"experience_id" gorm:"column:experience_id"`
}

// Struct Personalia (Perubahan di sini: Lokasi dihapus)
type Personalia struct {
	PersonaliaID int     `gorm:"primaryKey;autoIncrement;column:personalia_id" json:"personalia_id"`
	NIP          string  `json:"nip" gorm:"column:nip;type:varchar(50)"`
	Jabatan      string  `json:"jabatan" gorm:"column:jabatan;type:varchar(50)"`
	Divisi       string  `json:"divisi" gorm:"column:divisi;type:varchar(100)"`
	Status       string  `json:"status" gorm:"column:status;type:varchar(100)"`
	JoinDate     string  `json:"joinDate" gorm:"column:join_date;type:date"`
	PhoneNumber  string  `json:"phoneNumber" gorm:"column:phone_number;type:varchar(50)"`
	UrgentNumber string  `json:"urgentNumber" gorm:"column:urgent_number;type:varchar(50)"`
	ProfileID    *int    `json:"profile_id" gorm:"column:profile_id"`
	Profile      Profile `json:"profile,omitempty" gorm:"foreignKey:ProfileID"`
}

func (Profile) TableName() string {
	return "profile"
}
func (Personalia) TableName() string {
	return "personalia"
}

var db *gorm.DB

func Init(database *gorm.DB) {
	db = database
	log.Println("Personalia module initialized. Auto-migration and constraint creation skipped as DB schema is fixed.")
}

func getAllPersonalia(c *gin.Context) {
	var personaliaItems []Personalia
	if result := db.Preload("Profile").Find(&personaliaItems); result.Error != nil {
		log.Printf("Error fetching personalia: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch personalia data"})
		return
	}
	c.JSON(http.StatusOK, personaliaItems)
}

func getPersonaliaByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid personalia ID"})
		return
	}

	var item Personalia
	if result := db.Preload("Profile").First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Personalia not found"})
		} else {
			log.Printf("Error fetching personalia with ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch personalia"})
		}
		return
	}

	c.JSON(http.StatusOK, item)
}

func createPersonalia(c *gin.Context) {
	var newItem Personalia
	if err := c.ShouldBindJSON(&newItem); err != nil {
		log.Printf("Error binding JSON for createPersonalia: %v", err) // Log lebih detail
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}

	// Validasi field yang wajib
	if newItem.NIP == "" || newItem.Jabatan == "" || newItem.Divisi == "" ||
		newItem.Status == "" || newItem.JoinDate == "" ||
		newItem.PhoneNumber == "" || newItem.UrgentNumber == "" {
		log.Println("Validation failed in createPersonalia: required fields are empty")             // Log lebih detail
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required (except ProfileID)"}) // Pesan error disesuaikan
		return
	}

	log.Printf("Attempting to create personalia in DB: %+v", newItem) // Log item sebelum disimpan
	if result := db.Create(&newItem); result.Error != nil {
		log.Printf("Error creating personalia in DB: %v", result.Error) // Log error dari GORM
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create personalia in database"})
		return
	}
	log.Printf("Successfully created personalia with ID: %d", newItem.PersonaliaID) // Log sukses

	// Reload the item with profile data, penting untuk mendapatkan ID yang di-generate GORM
	var createdItem Personalia
	// Pastikan newItem.PersonaliaID sudah terisi setelah db.Create
	if newItem.PersonaliaID == 0 {
		log.Println("Warning: newItem.PersonaliaID is 0 after db.Create. Reload might fail.")
	}
	db.Preload("Profile").First(&createdItem, newItem.PersonaliaID)
	log.Printf("Reloaded created item for response: %+v", createdItem) // Log item yang akan dikirim

	c.JSON(http.StatusCreated, createdItem) // Mengembalikan status 201 Created
}

func updatePersonalia(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid personalia ID"})
		return
	}

	var updatedItem Personalia
	if err := c.ShouldBindJSON(&updatedItem); err != nil {
		log.Printf("Error binding JSON for updatePersonalia: %v", err) // Log lebih detail
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}

	// Validasi field yang wajib
	if updatedItem.NIP == "" || updatedItem.Jabatan == "" || updatedItem.Divisi == "" ||
		updatedItem.Status == "" || updatedItem.JoinDate == "" ||
		updatedItem.PhoneNumber == "" || updatedItem.UrgentNumber == "" {
		log.Println("Validation failed in updatePersonalia: required fields are empty") // Log lebih detail
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}

	var item Personalia
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Personalia not found"})
		} else {
			log.Printf("Error finding personalia with ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find personalia"})
		}
		return
	}

	// Update fields
	item.NIP = updatedItem.NIP
	item.Jabatan = updatedItem.Jabatan
	item.Divisi = updatedItem.Divisi
	item.Status = updatedItem.Status
	item.JoinDate = updatedItem.JoinDate
	item.PhoneNumber = updatedItem.PhoneNumber
	item.UrgentNumber = updatedItem.UrgentNumber
	item.ProfileID = updatedItem.ProfileID // Sekarang bisa menerima nil/pointer

	log.Printf("Attempting to update personalia ID %d in DB: %+v", id, item) // Log item sebelum disimpan
	if result := db.Save(&item); result.Error != nil {
		log.Printf("Error updating personalia with ID %d: %v", id, result.Error) // Log error dari GORM
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update personalia"})
		return
	}
	log.Printf("Successfully updated personalia ID: %d", item.PersonaliaID) // Log sukses

	// Reload the item with profile data
	var savedItem Personalia
	db.Preload("Profile").First(&savedItem, item.PersonaliaID)
	log.Printf("Reloaded updated item for response: %+v", savedItem) // Log item yang akan dikirim

	c.JSON(http.StatusOK, savedItem)
}

func deletePersonalia(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid personalia ID"})
		return
	}

	var item Personalia
	if result := db.First(&item, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Personalia not found"})
		} else {
			log.Printf("Error finding personalia with ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find personalia"})
		}
		return
	}

	if result := db.Delete(&item); result.Error != nil {
		log.Printf("Error deleting personalia with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete personalia"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func AssignProfileToPersonalia(c *gin.Context) {
	idStr := c.Param("id") // Ambil ID dari URL
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid personalia ID"})
		return
	}

	var input struct {
		ProfileID *int `json:"profile_id"` // Menggunakan pointer untuk nullability
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var personalia Personalia
	if err := db.First(&personalia, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Personalia not found"})
		return
	}

	personalia.ProfileID = input.ProfileID // Langsung assign pointer

	// Validasi jika ProfileID tidak nil, pastikan profile-nya ada
	if input.ProfileID != nil {
		var profile Profile
		if err := db.First(&profile, *input.ProfileID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Profile not found"})
			return
		}
	}

	if err := db.Save(&personalia).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile_id"})
		return
	}

	// Reload personalia untuk memastikan relasi Profile terisi jika baru di-assign
	db.Preload("Profile").First(&personalia, id)

	c.JSON(http.StatusOK, personalia)
}

// exportPersonaliaToExcel menggenerasi dan mengirimkan file Excel data personalia
func exportPersonaliaToExcel(c *gin.Context) {
	var personaliaItems []Personalia
	if result := db.Preload("Profile").Find(&personaliaItems); result.Error != nil {
		log.Printf("Error fetching personalia for Excel export: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch personalia data for export"})
		return
	}

	f := excelize.NewFile()
	sheetName := "Personalia Data"
	index, err := f.NewSheet(sheetName)
	if err != nil {
		log.Printf("Error creating new Excel sheet: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Excel file"})
		return
	}

	// Set header kolom
	headers := []string{"ID", "NIP", "Jabatan", "Divisi", "Status", "Tanggal Bergabung", "No. Telepon", "No. Darurat", "Email Profil", "Alamat Profil"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1) // Baris pertama
		f.SetCellValue(sheetName, cell, header)
	}

	// Isi data personalia
	for i, item := range personaliaItems {
		rowNum := i + 2 // Mulai dari baris kedua setelah header
		f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), item.PersonaliaID)
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowNum), item.NIP)
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowNum), item.Jabatan)
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", rowNum), item.Divisi)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", rowNum), item.Status)
		f.SetCellValue(sheetName, fmt.Sprintf("F%d", rowNum), item.JoinDate)
		f.SetCellValue(sheetName, fmt.Sprintf("G%d", rowNum), item.PhoneNumber)
		f.SetCellValue(sheetName, fmt.Sprintf("H%d", rowNum), item.UrgentNumber)

		// Cek apakah ada profil terkait
		profileEmail := ""
		profileAddress := ""
		if item.ProfileID != nil && item.Profile.Email != "" { // Pastikan ProfileID tidak nil dan Profile terisi
			profileEmail = item.Profile.Email
			profileAddress = item.Profile.Address
		}
		f.SetCellValue(sheetName, fmt.Sprintf("I%d", rowNum), profileEmail)
		f.SetCellValue(sheetName, fmt.Sprintf("J%d", rowNum), profileAddress)
	}

	f.SetActiveSheet(index)

	// Set header HTTP untuk download file
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=personalia_data_%s.xlsx", time.Now().Format("20060102")))
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Cache-Control", "no-cache")

	if err := f.Write(c.Writer); err != nil {
		log.Printf("Error writing Excel file to response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write Excel file to response"})
		return
	}
}

// exportPersonaliaToPDF menggenerasi dan mengirimkan file PDF data personalia
func exportPersonaliaToPDF(c *gin.Context) {
	var personaliaItems []Personalia
	if result := db.Preload("Profile").Find(&personaliaItems); result.Error != nil {
		log.Printf("Error fetching personalia for PDF export: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch personalia data for export"})
		return
	}

	pdf := gofpdf.New("P", "mm", "A4", "") // Portrait, milimeter, A4
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Data Personalia PT Kereta Api Indonesia")
	pdf.Ln(12) // Line break

	pdf.SetFont("Arial", "B", 10)
	// Header Tabel
	header := []string{"ID", "NIP", "Jabatan", "Divisi", "Status", "Join Date", "Phone", "Urgent Phone", "Email", "Address"}
	colWidths := []float64{10, 25, 25, 25, 15, 25, 25, 25, 30, 40} // Sesuaikan lebar kolom

	// Print header
	for i, h := range header {
		pdf.Cell(colWidths[i], 7, h)
	}
	pdf.Ln(-1) // New line

	pdf.SetFont("Arial", "", 8) // Font untuk data
	// Data Tabel
	for _, item := range personaliaItems {
		profileEmail := ""
		profileAddress := ""
		if item.ProfileID != nil && item.Profile.Email != "" {
			profileEmail = item.Profile.Email
			profileAddress = item.Profile.Address
		}

		row := []string{
			strconv.Itoa(item.PersonaliaID),
			item.NIP,
			item.Jabatan,
			item.Divisi,
			item.Status,
			item.JoinDate,
			item.PhoneNumber,
			item.UrgentNumber,
			profileEmail,
			profileAddress,
		}

		// Jika baris terlalu panjang, wrap teks atau sesuaikan lebar kolom.
		// Untuk contoh ini, kita asumsikan teks cukup pendek atau lebar kolom sudah sesuai.
		for i, data := range row {
			// Jika teks terlalu panjang untuk kolom, potong teks
			if pdf.GetStringWidth(data) > colWidths[i] {
				// Memotong teks jika terlalu panjang
				for len(data) > 0 && pdf.GetStringWidth(data) > colWidths[i] {
					data = data[:len(data)-1]
				}
				// Tambahkan elipsis jika teks dipotong
				if len(data) > 3 { // pastikan ada cukup ruang untuk elipsis
					data = data[:len(data)-3] + "..."
				}
			}
			pdf.Cell(colWidths[i], 7, data)
		}
		pdf.Ln(-1) // New line for next row
	}

	// Set header HTTP untuk download file
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=personalia_data_%s.pdf", time.Now().Format("20060102")))
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Cache-Control", "no-cache")

	if err := pdf.Output(c.Writer); err != nil {
		log.Printf("Error writing PDF file to response: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write PDF file to response"})
		return
	}
}

// RegisterRoutes
func RegisterRoutes(r *gin.RouterGroup) {
	// Mendaftarkan route untuk GET dan POST agar bisa menerima baik dengan atau tanpa trailing slash
	r.GET("", getAllPersonalia)  // Menangani /api/personalia
	r.GET("/", getAllPersonalia) // Menangani /api/personalia/

	r.GET("/:id", getPersonaliaByID)

	r.POST("", createPersonalia)  // Menangani /api/personalia
	r.POST("/", createPersonalia) // Menangani /api/personalia/

	r.PUT("/:id", updatePersonalia)
	r.DELETE("/:id", deletePersonalia)
	r.PUT("/:id/assign-profile", AssignProfileToPersonalia)

	// NEW: Endpoint untuk export Excel
	r.GET("/export/excel", exportPersonaliaToExcel)
	// NEW: Endpoint untuk export PDF
	r.GET("/export/pdf", exportPersonaliaToPDF)
}
