package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

type Personalia struct {
	PersonaliaID int    `json:"personalia_id"`
	NIP          string `json:"nip"`
	Name         string `json:"name"`
	Jabatan      string `json:"jabatan"`
	Divisi       string `json:"divisi"`
	Lokasi       string `json:"lokasi"`
	Status       string `json:"status"`
	NPWPNo       string `json:"npwp_no"`
	PhoneNumber  string `json:"phone_number"`
	UrgentNumber string `json:"urgent_number"`
	ProfileID    int    `json:"profile_id"`
}

type Rekayasa struct {
	RekayasaID int    `json:"rekayasa_id"`
	Name       string `json:"name"`
	Status     string `json:"status"`
	Deadline   string `json:"deadline"`
	Progress   int    `json:"progress"`
	Team       []PersonaliaTeam `json:"team"` 
}

type RekayasaTeam struct {
	RekayasaTeamID int `json:"rekayasa_team_id"`
	PersonaliaID   int `json:"personalia_id"`
	RekayasaID     int `json:"rekayasa_id"`
}

type PersonaliaTeam struct {
	PersonaliaID int    `json:"personalia_id"`
	NIP          string `json:"nip"`
	Name         string `json:"name"`
	Jabatan      string `json:"jabatan"`
	Divisi       string `json:"divisi"`
}

func connectDB() {
	var err error
	db, err = sql.Open("mysql", "username:password@tcp(localhost:3306)/kai_balai_yasa")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}
	
	log.Println("Database connected successfully")
}
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


func getAllRekayasa(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	
	rows, err := db.Query("SELECT rekayasa_id, name, status, deadline, progress FROM rekayasa")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var list []Rekayasa
	for rows.Next() {
		var rk Rekayasa
		if err := rows.Scan(&rk.RekayasaID, &rk.Name, &rk.Status, &rk.Deadline, &rk.Progress); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
	
		team, err := getTeamByRekayasaID(rk.RekayasaID)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		rk.Team = team
		
		list = append(list, rk)
	}
	json.NewEncoder(w).Encode(list)
}

func getRekayasaByID(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	
	id := mux.Vars(r)["id"]

	var rk Rekayasa
	err := db.QueryRow("SELECT rekayasa_id, name, status, deadline, progress FROM rekayasa WHERE rekayasa_id = ?", id).
		Scan(&rk.RekayasaID, &rk.Name, &rk.Status, &rk.Deadline, &rk.Progress)
	if err == sql.ErrNoRows {
		http.Error(w, "Data not found", 404)
		return
	} else if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	team, err := getTeamByRekayasaID(rk.RekayasaID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	rk.Team = team

	json.NewEncoder(w).Encode(rk)
}

func createRekayasa(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	
	var rk Rekayasa
	if err := json.NewDecoder(r.Body).Decode(&rk); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), 400)
		return
	
	result, err := db.Exec("INSERT INTO rekayasa (name, status, deadline, progress) VALUES (?, ?, ?, ?)",
		rk.Name, rk.Status, rk.Deadline, rk.Progress)
	if err != nil {
		http.Error(w, "Failed to insert: "+err.Error(), 500)
		return
	}

	// Get the inserted ID
	rekayasaID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, "Failed to get insert ID: "+err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Data inserted successfully",
		"rekayasa_id": rekayasaID,
	})
}

func updateRekayasa(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	
	id := mux.Vars(r)["id"]
	var rk Rekayasa
	if err := json.NewDecoder(r.Body).Decode(&rk); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	result, err := db.Exec(`UPDATE rekayasa SET name=?, status=?, deadline=?, progress=? WHERE rekayasa_id=?`,
		rk.Name, rk.Status, rk.Deadline, rk.Progress, id)
	if err != nil {
		http.Error(w, "Failed to update: "+err.Error(), 500)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Data not found", 404)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Updated successfully"})
}

func deleteRekayasa(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	
	id := mux.Vars(r)["id"]
	
	// Delete team assignments first
	_, err := db.Exec("DELETE FROM rekayasa_team WHERE rekayasa_id = ?", id)
	if err != nil {
		http.Error(w, "Failed to delete team assignments: "+err.Error(), 500)
		return
	}
	
	// Delete rekayasa
	result, err := db.Exec("DELETE FROM rekayasa WHERE rekayasa_id = ?", id)
	if err != nil {
		http.Error(w, "Failed to delete: "+err.Error(), 500)
		return
	}
	
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Data not found", 404)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// ======================= TEAM MANAGEMENT =======================

func addTeamMember(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	
	var teamMember RekayasaTeam
	if err := json.NewDecoder(r.Body).Decode(&teamMember); err != nil {
		http.Error(w, "Invalid input: "+err.Error(), 400)
		return
	}

	_, err := db.Exec("INSERT INTO rekayasa_team (personalia_id, rekayasa_id) VALUES (?, ?)",
		teamMember.PersonaliaID, teamMember.RekayasaID)
	if err != nil {
		http.Error(w, "Failed to add team member: "+err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Team member added successfully"})
}

func removeTeamMember(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	
	rekayasaID := mux.Vars(r)["rekayasa_id"]
	personaliaID := mux.Vars(r)["personalia_id"]
	
	result, err := db.Exec("DELETE FROM rekayasa_team WHERE rekayasa_id = ? AND personalia_id = ?", 
		rekayasaID, personaliaID)
	if err != nil {
		http.Error(w, "Failed to remove team member: "+err.Error(), 500)
		return
	}
	
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Team member not found", 404)
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}

// ======================= HELPER FUNCTIONS =======================

func getTeamByRekayasaID(rekayasaID int) ([]PersonaliaTeam, error) {
	query := `
		SELECT p.personalia_id, p.nip, p.name, p.jabatan, p.divisi
		FROM personalia p
		INNER JOIN rekayasa_team rt ON p.personalia_id = rt.personalia_id
		WHERE rt.rekayasa_id = ?
	`
	
	rows, err := db.Query(query, rekayasaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var team []PersonaliaTeam
	for rows.Next() {
		var member PersonaliaTeam
		if err := rows.Scan(&member.PersonaliaID, &member.NIP, &member.Name, &member.Jabatan, &member.Divisi); err != nil {
			return nil, err
		}
		team = append(team, member)
	}
	
	return team, nil
}

// ======================= PERSONALIA HANDLERS =======================

func getAllPersonalia(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")
	
	rows, err := db.Query("SELECT personalia_id, nip, name, jabatan, divisi, lokasi, status, npwp_no, phone_number, urgent_number, profile_id FROM personalia")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var list []Personalia
	for rows.Next() {
		var p Personalia
		if err := rows.Scan(&p.PersonaliaID, &p.NIP, &p.Name, &p.Jabatan, &p.Divisi, &p.Lokasi, &p.Status, &p.NPWPNo, &p.PhoneNumber, &p.UrgentNumber, &p.ProfileID); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		list = append(list, p)
	}
	json.NewEncoder(w).Encode(list)
}

// ======================= MAIN =======================

func main() {
	connectDB()
	defer db.Close()
	
	r := mux.NewRouter()
	
	// Apply CORS middleware
	r.Use(corsMiddleware)
	
	// Rekayasa routes
	r.HandleFunc("/api/rekayasa", getAllRekayasa).Methods("GET")
	r.HandleFunc("/api/rekayasa/{id}", getRekayasaByID).Methods("GET")
	r.HandleFunc("/api/rekayasa", createRekayasa).Methods("POST")
	r.HandleFunc("/api/rekayasa/{id}", updateRekayasa).Methods("PUT")
	r.HandleFunc("/api/rekayasa/{id}", deleteRekayasa).Methods("DELETE")
	
	// Team management routes
	r.HandleFunc("/api/rekayasa/team", addTeamMember).Methods("POST")
	r.HandleFunc("/api/rekayasa/{rekayasa_id}/team/{personalia_id}", removeTeamMember).Methods("DELETE")
	
	// Personalia routes
	r.HandleFunc("/api/personalia", getAllPersonalia).Methods("GET")
	
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}