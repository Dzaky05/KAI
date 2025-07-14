package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

// Struct untuk tabel personalia
type Personalia struct {
	ID           int    `json:"id"`
	NIP          string `json:"nip"`
	Jabatan      string `json:"jabatan"`
	Divisi       string `json:"divisi"`
	Lokasi       string `json:"lokasi"`
	Status       string `json:"status"`
	JoinDate     string `json:"joinDate"`
	PhoneNumber  string `json:"phoneNumber"`
	UrgentNumber string `json:"urgentNumber"`
	ProfileID    int    `json:"profile_id"`
}

var db *sql.DB

func connectDB() {
	var err error
	dsn := "root:@tcp(127.0.0.1:3306)/kai_balai_yasa"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal(err)
	}
	log.Println("Database connected!")
}

// Get semua personalia
func getPersonalia(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT personalia_id, nip, jabatan, divisi, lokasi, status, join_date, phone_number, urgent_number, profile_id FROM personalia")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []Personalia
	for rows.Next() {
		var p Personalia
		err := rows.Scan(&p.ID, &p.NIP, &p.Jabatan, &p.Divisi, &p.Lokasi, &p.Status, &p.JoinDate, &p.PhoneNumber, &p.UrgentNumber, &p.ProfileID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		result = append(result, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// Get personalia by ID
func getPersonaliaByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var p Personalia
	err := db.QueryRow("SELECT personalia_id, nip, jabatan, divisi, lokasi, status, join_date, phone_number, urgent_number, profile_id FROM personalia WHERE personalia_id = ?", id).
		Scan(&p.ID, &p.NIP, &p.Jabatan, &p.Divisi, &p.Lokasi, &p.Status, &p.JoinDate, &p.PhoneNumber, &p.UrgentNumber, &p.ProfileID)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Data not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

// Create personalia
func createPersonalia(w http.ResponseWriter, r *http.Request) {
	var p Personalia
	json.NewDecoder(r.Body).Decode(&p)

	stmt, err := db.Prepare(`INSERT INTO personalia (nip, jabatan, divisi, lokasi, status, join_date, phone_number, urgent_number, profile_id)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	res, err := stmt.Exec(p.NIP, p.Jabatan, p.Divisi, p.Lokasi, p.Status, p.JoinDate, p.PhoneNumber, p.UrgentNumber, p.ProfileID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	id, _ := res.LastInsertId()
	p.ID = int(id)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

// Update personalia
func updatePersonalia(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var p Personalia
	json.NewDecoder(r.Body).Decode(&p)

	_, err := db.Exec(`UPDATE personalia SET nip=?, jabatan=?, divisi=?, lokasi=?, status=?, join_date=?, phone_number=?, urgent_number=?, profile_id=? WHERE personalia_id=?`,
		p.NIP, p.Jabatan, p.Divisi, p.Lokasi, p.Status, p.JoinDate, p.PhoneNumber, p.UrgentNumber, p.ProfileID, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Delete personalia
func deletePersonalia(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	_, err := db.Exec("DELETE FROM personalia WHERE personalia_id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// Get personalia by divisi
func getPersonaliaByDivisi(w http.ResponseWriter, r *http.Request) {
	divisi := mux.Vars(r)["divisi"]
	rows, err := db.Query("SELECT personalia_id, nip, jabatan, divisi, lokasi, status, join_date, phone_number, urgent_number, profile_id FROM personalia WHERE divisi = ?", divisi)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []Personalia
	for rows.Next() {
		var p Personalia
		err := rows.Scan(&p.ID, &p.NIP, &p.Jabatan, &p.Divisi, &p.Lokasi, &p.Status, &p.JoinDate, &p.PhoneNumber, &p.UrgentNumber, &p.ProfileID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		result = append(result, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// Get personalia by status
func getPersonaliaByStatus(w http.ResponseWriter, r *http.Request) {
	status := mux.Vars(r)["status"]
	rows, err := db.Query("SELECT personalia_id, nip, jabatan, divisi, lokasi, status, join_date, phone_number, urgent_number, profile_id FROM personalia WHERE status = ?", status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []Personalia
	for rows.Next() {
		var p Personalia
		err := rows.Scan(&p.ID, &p.NIP, &p.Jabatan, &p.Divisi, &p.Lokasi, &p.Status, &p.JoinDate, &p.PhoneNumber, &p.UrgentNumber, &p.ProfileID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		result = append(result, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func main() {
	connectDB()
	r := mux.NewRouter()

	// Personalia routes
	r.HandleFunc("/api/personalia", getPersonalia).Methods("GET")
	r.HandleFunc("/api/personalia/{id}", getPersonaliaByID).Methods("GET")
	r.HandleFunc("/api/personalia", createPersonalia).Methods("POST")
	r.HandleFunc("/api/personalia/{id}", updatePersonalia).Methods("PUT")
	r.HandleFunc("/api/personalia/{id}", deletePersonalia).Methods("DELETE")

	// Additional filtering routes
	r.HandleFunc("/api/personalia/divisi/{divisi}", getPersonaliaByDivisi).Methods("GET")
	r.HandleFunc("/api/personalia/status/{status}", getPersonaliaByStatus).Methods("GET")

	log.Println("Server running on port 8080...")
	http.ListenAndServe(":8080", r)
}
