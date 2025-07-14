package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

// Profile struct sesuai dengan table profile
type Profile struct {
	ID           int         `json:"id"`
	Name         string      `json:"name"`
	Email        string      `json:"email"`
	Phone        string      `json:"phone"`
	Address      string      `json:"address"`
	EducationID  *int        `json:"educationId"`
	ExperienceID *int        `json:"experienceId"`
	PersonaliaID int         `json:"personaliaId"`
	Education    *Education  `json:"education,omitempty"`
	Experience   *Experience `json:"experience,omitempty"`
	Personalia   *Personalia `json:"personalia,omitempty"`
}

// Education struct sesuai dengan table education
type Education struct {
	ID         int    `json:"id"`
	Degree     string `json:"degree"`
	University string `json:"university"`
	Year       int    `json:"year"`
}

// Experience struct sesuai dengan table experience
type Experience struct {
	ID       int    `json:"id"`
	Position string `json:"position"`
	Period   string `json:"period"`
}

// Personalia struct sesuai dengan table personalia
type Personalia struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	NIP           string `json:"nip"`
	Jabatan       string `json:"jabatan"`
	Divisi        string `json:"divisi"`
	Lokasi        string `json:"lokasi"`
	JoinDate      string `json:"joinDate"`
	PhoneNumber   string `json:"phoneNumber"`
	ProjectNumber string `json:"projectNumber"`
	ProfileID     *int   `json:"profileId"`
}

// Request structs untuk create/update
type CreateProfileRequest struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
	EducationID  *int   `json:"educationId"`
	ExperienceID *int   `json:"experienceId"`
	PersonaliaID int    `json:"personaliaId"`
}

type UpdateProfileRequest struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Address      string `json:"address"`
	EducationID  *int   `json:"educationId"`
	ExperienceID *int   `json:"experienceId"`
}

type CreateEducationRequest struct {
	Degree     string `json:"degree"`
	University string `json:"university"`
	Year       int    `json:"year"`
}

type CreateExperienceRequest struct {
	Position string `json:"position"`
	Period   string `json:"period"`
}

var db *sql.DB

func initDB() {
	var err error
	dsn := "root:@tcp(localhost:3306)/kai_balai_yasa"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
}

// Enable CORS
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// GET all profiles
func getAllProfiles(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query(`
		SELECT p.id, p.name, p.email, p.phone, p.address, p.education_id, p.experience_id, p.personalia_id
		FROM profile p
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var profiles []Profile
	for rows.Next() {
		var p Profile
		err := rows.Scan(&p.ID, &p.Name, &p.Email, &p.Phone, &p.Address, &p.EducationID, &p.ExperienceID, &p.PersonaliaID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Load related data
		if p.EducationID != nil {
			p.Education = getEducationByID(*p.EducationID)
		}
		if p.ExperienceID != nil {
			p.Experience = getExperienceByID(*p.ExperienceID)
		}
		p.Personalia = getPersonaliaByID(p.PersonaliaID)

		profiles = append(profiles, p)
	}

	json.NewEncoder(w).Encode(profiles)
}

// GET profile by ID
func getProfileByID(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid profile ID", http.StatusBadRequest)
		return
	}

	var p Profile
	err = db.QueryRow(`
		SELECT p.id, p.name, p.email, p.phone, p.address, p.education_id, p.experience_id, p.personalia_id
		FROM profile p 
		WHERE p.id = ?
	`, id).Scan(&p.ID, &p.Name, &p.Email, &p.Phone, &p.Address, &p.EducationID, &p.ExperienceID, &p.PersonaliaID)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Profile not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Load related data
	if p.EducationID != nil {
		p.Education = getEducationByID(*p.EducationID)
	}
	if p.ExperienceID != nil {
		p.Experience = getExperienceByID(*p.ExperienceID)
	}
	p.Personalia = getPersonaliaByID(p.PersonaliaID)

	json.NewEncoder(w).Encode(p)
}

// GET profile by personalia ID
func getProfileByPersonaliaID(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	personaliaID, err := strconv.Atoi(vars["personaliaId"])
	if err != nil {
		http.Error(w, "Invalid personalia ID", http.StatusBadRequest)
		return
	}

	var p Profile
	err = db.QueryRow(`
		SELECT p.id, p.name, p.email, p.phone, p.address, p.education_id, p.experience_id, p.personalia_id
		FROM profile p 
		WHERE p.personalia_id = ?
	`, personaliaID).Scan(&p.ID, &p.Name, &p.Email, &p.Phone, &p.Address, &p.EducationID, &p.ExperienceID, &p.PersonaliaID)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Profile not found for this personalia", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Load related data
	if p.EducationID != nil {
		p.Education = getEducationByID(*p.EducationID)
	}
	if p.ExperienceID != nil {
		p.Experience = getExperienceByID(*p.ExperienceID)
	}
	p.Personalia = getPersonaliaByID(p.PersonaliaID)

	json.NewEncoder(w).Encode(p)
}

// POST create profile
func createProfile(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	var req CreateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Insert profile
	result, err := tx.Exec(`
		INSERT INTO profile (name, email, phone, address, education_id, experience_id, personalia_id) 
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, req.Name, req.Email, req.Phone, req.Address, req.EducationID, req.ExperienceID, req.PersonaliaID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	profileID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update personalia with profile_id
	_, err = tx.Exec(`UPDATE personalia SET profile_id = ? WHERE id = ?`, profileID, req.PersonaliaID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Profile created successfully",
		"id":      profileID,
	})
}

// PUT update profile
func updateProfile(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid profile ID", http.StatusBadRequest)
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	_, err = db.Exec(`
		UPDATE profile 
		SET name = ?, email = ?, phone = ?, address = ?, education_id = ?, experience_id = ? 
		WHERE id = ?
	`, req.Name, req.Email, req.Phone, req.Address, req.EducationID, req.ExperienceID, id)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated successfully"})
}

// DELETE profile
func deleteProfile(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid profile ID", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Get personalia_id before deleting profile
	var personaliaID int
	err = tx.QueryRow(`SELECT personalia_id FROM profile WHERE id = ?`, id).Scan(&personaliaID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update personalia to remove profile_id reference
	_, err = tx.Exec(`UPDATE personalia SET profile_id = NULL WHERE id = ?`, personaliaID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete profile
	_, err = tx.Exec(`DELETE FROM profile WHERE id = ?`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Profile deleted successfully"})
}

// Education endpoints
func getAllEducations(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query(`SELECT id, degree, university, year FROM education`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var educations []Education
	for rows.Next() {
		var e Education
		err := rows.Scan(&e.ID, &e.Degree, &e.University, &e.Year)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		educations = append(educations, e)
	}

	json.NewEncoder(w).Encode(educations)
}

func createEducation(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	var req CreateEducationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	result, err := db.Exec(`INSERT INTO education (degree, university, year) VALUES (?, ?, ?)`,
		req.Degree, req.University, req.Year)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Education created successfully",
		"id":      id,
	})
}

// Experience endpoints
func getAllExperiences(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query(`SELECT id, position, period FROM experience`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var experiences []Experience
	for rows.Next() {
		var e Experience
		err := rows.Scan(&e.ID, &e.Position, &e.Period)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		experiences = append(experiences, e)
	}

	json.NewEncoder(w).Encode(experiences)
}

func createExperience(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	var req CreateExperienceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	result, err := db.Exec(`INSERT INTO experience (position, period) VALUES (?, ?)`,
		req.Position, req.Period)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Experience created successfully",
		"id":      id,
	})
}

// Helper functions
func getEducationByID(id int) *Education {
	var e Education
	err := db.QueryRow(`SELECT id, degree, university, year FROM education WHERE id = ?`, id).
		Scan(&e.ID, &e.Degree, &e.University, &e.Year)
	if err != nil {
		return nil
	}
	return &e
}

func getExperienceByID(id int) *Experience {
	var e Experience
	err := db.QueryRow(`SELECT id, position, period FROM experience WHERE id = ?`, id).
		Scan(&e.ID, &e.Position, &e.Period)
	if err != nil {
		return nil
	}
	return &e
}

func getPersonaliaByID(id int) *Personalia {
	var p Personalia
	err := db.QueryRow(`
		SELECT id, name, nip, jabatan, divisi, lokasi, join_date, phone_number, project_number, profile_id 
		FROM personalia WHERE id = ?
	`, id).Scan(&p.ID, &p.Name, &p.NIP, &p.Jabatan, &p.Divisi, &p.Lokasi, &p.JoinDate, &p.PhoneNumber, &p.ProjectNumber, &p.ProfileID)
	if err != nil {
		return nil
	}
	return &p
}

func main() {
	initDB()
	defer db.Close()

	r := mux.NewRouter()
	r.Use(corsMiddleware)

	// Profile routes
	r.HandleFunc("/api/profiles", getAllProfiles).Methods("GET")
	r.HandleFunc("/api/profiles/{id}", getProfileByID).Methods("GET")
	r.HandleFunc("/api/profiles/personalia/{personaliaId}", getProfileByPersonaliaID).Methods("GET")
	r.HandleFunc("/api/profiles", createProfile).Methods("POST")
	r.HandleFunc("/api/profiles/{id}", updateProfile).Methods("PUT")
	r.HandleFunc("/api/profiles/{id}", deleteProfile).Methods("DELETE")

	// Education routes
	r.HandleFunc("/api/educations", getAllEducations).Methods("GET")
	r.HandleFunc("/api/educations", createEducation).Methods("POST")

	// Experience routes
	r.HandleFunc("/api/experiences", getAllExperiences).Methods("GET")
	r.HandleFunc("/api/experiences", createExperience).Methods("POST")

	fmt.Println("Server running on :8080")
	fmt.Println("Profile API endpoints:")
	fmt.Println("GET    /api/profiles                    - Get all profiles")
	fmt.Println("GET    /api/profiles/{id}              - Get profile by ID")
	fmt.Println("GET    /api/profiles/personalia/{id}   - Get profile by personalia ID")
	fmt.Println("POST   /api/profiles                    - Create new profile")
	fmt.Println("PUT    /api/profiles/{id}              - Update profile")
	fmt.Println("DELETE /api/profiles/{id}              - Delete profile")
	fmt.Println("GET    /api/educations                  - Get all educations")
	fmt.Println("POST   /api/educations                  - Create education")
	fmt.Println("GET    /api/experiences                 - Get all experiences")
	fmt.Println("POST   /api/experiences                 - Create experience")

	log.Fatal(http.ListenAndServe(":8080", r))
}
