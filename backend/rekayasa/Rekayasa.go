package rekayasa

import (
	"log"
	"net/http"
	"strconv"
	"strings" // Import package strings untuk Join dan Split

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Rekayasa mewakili struktur data untuk item rekayasa di database
type Rekayasa struct {
	RekayasaID int    `json:"id" gorm:"column:rekayasa_id;primaryKey;autoIncrement"`
	Name       string `json:"name" gorm:"column:name"`
	Status     string `json:"status" gorm:"column:status"`
	// Team sekarang bertipe string di Go untuk disimpan sebagai VARCHAR/TEXT di DB.
	// `json:"-"` agar GORM tidak mencoba mem-bind ini langsung dari JSON request body,
	// karena kita akan mengonversinya secara manual dari RekayasaFrontend.Team.
	Team     string `json:"-" gorm:"column:team"`
	Deadline string `json:"deadline" gorm:"column:deadline"` // Frontend mengirim string tanggal
	Progress int    `json:"progress" gorm:"column:progress"` // Frontend mengirim int, asumsikan kolom DB INT
}

// Struct untuk menerima dan mengirim data ke/dari frontend (Team sebagai []string)
type RekayasaFrontend struct {
	RekayasaID int      `json:"id"`
	Name       string   `json:"name"`
	Status     string   `json:"status"`
	Team       []string `json:"team"` // Menerima dan mengirim array string dari/ke frontend
	Deadline   string   `json:"deadline"`
	Progress   int      `json:"progress"`
}

// TableName mengembalikan nama tabel untuk model Rekayasa
func (Rekayasa) TableName() string {
	return "rekayasa" // <--- PERUBAHAN DI SINI: Menggunakan nama tabel 'rekayasa'
}

var db *gorm.DB

// Init menginisialisasi koneksi database untuk modul rekayasa
func Init(database *gorm.DB) {
	db = database
	log.Println("Rekayasa module initialized.")
}

// getAllProjects mengambil semua proyek dari database dan mengonversinya untuk frontend
func getAllProjects(c *gin.Context) {
	var projectsDB []Rekayasa // Ambil dari DB sebagai struct dengan Team string
	if result := db.Find(&projectsDB); result.Error != nil {
		log.Printf("Error fetching projects: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}

	var projectsFrontend []RekayasaFrontend // Konversi ke struct untuk frontend (Team sebagai []string)
	for _, pDB := range projectsDB {
		var teamSlice []string
		if pDB.Team != "" {
			// Konversi string yang dipisahkan koma menjadi []string
			teamSlice = strings.Split(pDB.Team, ", ")
		}
		projectsFrontend = append(projectsFrontend, RekayasaFrontend{
			RekayasaID: pDB.RekayasaID,
			Name:       pDB.Name,
			Status:     pDB.Status,
			Team:       teamSlice, // Gunakan slice yang sudah di-split
			Deadline:   pDB.Deadline,
			Progress:   pDB.Progress,
		})
	}

	c.JSON(http.StatusOK, projectsFrontend)
}

// getProjectByID mengambil proyek berdasarkan ID dan mengonversinya untuk frontend
func getProjectByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	var projectDB Rekayasa // Ambil dari DB sebagai struct dengan Team string
	if result := db.First(&projectDB, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			log.Printf("Error fetching project with ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
		}
		return
	}

	var teamSlice []string
	if projectDB.Team != "" {
		// Konversi string yang dipisahkan koma menjadi []string
		teamSlice = strings.Split(projectDB.Team, ", ")
	}

	projectFrontend := RekayasaFrontend{
		RekayasaID: projectDB.RekayasaID,
		Name:       projectDB.Name,
		Status:     projectDB.Status,
		Team:       teamSlice, // Gunakan slice yang sudah di-split
		Deadline:   projectDB.Deadline,
		Progress:   projectDB.Progress,
	}

	c.JSON(http.StatusOK, projectFrontend)
}

// createProject menambahkan proyek baru ke database
func createProject(c *gin.Context) {
	var newProjectFrontend RekayasaFrontend // Terima dari frontend sebagai struct dengan Team []string
	if err := c.ShouldBindJSON(&newProjectFrontend); err != nil {
		log.Printf("Error binding JSON for createProject: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}

	// Validasi sederhana
	if newProjectFrontend.Name == "" || newProjectFrontend.Deadline == "" || len(newProjectFrontend.Team) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name, Deadline, and Team are required"})
		return
	}
	if newProjectFrontend.Progress < 0 || newProjectFrontend.Progress > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Progress must be between 0 and 100"})
		return
	}

	// Konversi Team []string dari frontend menjadi string yang dipisahkan koma untuk database
	teamString := strings.Join(newProjectFrontend.Team, ", ")

	newProjectDB := Rekayasa{
		Name:     newProjectFrontend.Name,
		Status:   newProjectFrontend.Status,
		Team:     teamString, // Simpan sebagai string yang dipisahkan koma
		Deadline: newProjectFrontend.Deadline,
		Progress: newProjectFrontend.Progress,
	}

	if result := db.Create(&newProjectDB); result.Error != nil {
		log.Printf("Error creating project in DB: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create project in database"})
		return
	}

	// Pastikan ID yang di-generate GORM dikembalikan ke frontend
	newProjectFrontend.RekayasaID = newProjectDB.RekayasaID
	c.JSON(http.StatusCreated, newProjectFrontend)
}

// updateProject memperbarui proyek yang sudah ada di database
func updateProject(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	var updatedProjectFrontend RekayasaFrontend // Terima dari frontend sebagai struct dengan Team []string
	if err := c.ShouldBindJSON(&updatedProjectFrontend); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data format", "details": err.Error()})
		return
	}

	if updatedProjectFrontend.Name == "" || updatedProjectFrontend.Deadline == "" || len(updatedProjectFrontend.Team) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name, Deadline, and Team are required"})
		return
	}
	if updatedProjectFrontend.Progress < 0 || updatedProjectFrontend.Progress > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Progress must be between 0 and 100"})
		return
	}

	var existingProjectDB Rekayasa // Ambil dari DB sebagai struct dengan Team string
	if result := db.First(&existingProjectDB, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			log.Printf("Error finding project with ID %d: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find project"})
		}
		return
	}

	// Konversi Team []string dari frontend menjadi string yang dipisahkan koma untuk database
	teamString := strings.Join(updatedProjectFrontend.Team, ", ")

	existingProjectDB.Name = updatedProjectFrontend.Name
	existingProjectDB.Status = updatedProjectFrontend.Status
	existingProjectDB.Team = teamString // Simpan sebagai string yang dipisahkan koma
	existingProjectDB.Deadline = updatedProjectFrontend.Deadline
	existingProjectDB.Progress = updatedProjectFrontend.Progress

	if result := db.Save(&existingProjectDB); result.Error != nil {
		log.Printf("Error updating project with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
		return
	}

	// Pastikan ID tetap sama dan kembalikan data yang diupdate ke frontend
	updatedProjectFrontend.RekayasaID = existingProjectDB.RekayasaID
	c.JSON(http.StatusOK, updatedProjectFrontend)
}

// deleteProject menghapus proyek dari database
func deleteProject(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	var project Rekayasa
	if result := db.First(&project, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		} else {
			log.Printf("Error finding project with ID %d for deletion: %v", id, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find project"})
		}
		return
	}

	if result := db.Delete(&project); result.Error != nil {
		log.Printf("Error deleting project with ID %d: %v", id, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// RegisterRoutes mendaftarkan rute API untuk modul rekayasa
func RegisterRoutes(r *gin.RouterGroup) {
	// Daftarkan rute untuk GET dan POST agar bisa menerima baik dengan atau tanpa trailing slash
	r.GET("", getAllProjects)  // Menangani /api/rekayasa (no trailing slash)
	r.GET("/", getAllProjects) // Menangani /api/rekayasa/ (with trailing slash)

	r.GET("/:id", getProjectByID)

	r.POST("", createProject)  // Menangani /api/rekayasa (no trailing slash)
	r.POST("/", createProject) // Menangani /api/rekayasa/ (with trailing slash)

	r.PUT("/:id", updateProject)
	r.DELETE("/:id", deleteProject)
}
