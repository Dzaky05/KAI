package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

type Overhaul struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Location     string `json:"location"`
	Status       string `json:"status"`
	Estimate     string `json:"estimate"`
	Progress     int    `json:"progress"`
	PersonaliaID int    `json:"personalia_id"`
	MaterialID   int    `json:"material_id"`
	InventoryID  int    `json:"inventory_id"`
	HistoryID    int    `json:"history_id"`
}

var db *sql.DB

func connectDB() {
	var err error
	dsn := "root:@tcp(127.0.0.1:3306)/kai_balai_yasa"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("DB Connection error:", err)
	}
}

func getAllOverhauls(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT * FROM overhaul")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var overhauls []Overhaul
	for rows.Next() {
		var o Overhaul
		if err := rows.Scan(&o.ID, &o.Name, &o.Location, &o.Status, &o.Estimate, &o.Progress, &o.PersonaliaID, &o.MaterialID, &o.InventoryID, &o.HistoryID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		overhauls = append(overhauls, o)
	}
	json.NewEncoder(w).Encode(overhauls)
}

func getOverhaulByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var o Overhaul
	err := db.QueryRow("SELECT * FROM overhaul WHERE overhaul_id = ?", id).Scan(&o.ID, &o.Name, &o.Location, &o.Status, &o.Estimate, &o.Progress, &o.PersonaliaID, &o.MaterialID, &o.InventoryID, &o.HistoryID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(o)
}

func createOverhaul(w http.ResponseWriter, r *http.Request) {
	var o Overhaul
	if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	query := `INSERT INTO overhaul (name, location, status, estimate, progress, personalia_id, material_id, inventory_id, history_id) 
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	res, err := db.Exec(query, o.Name, o.Location, o.Status, o.Estimate, o.Progress, o.PersonaliaID, o.MaterialID, o.InventoryID, o.HistoryID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	id, _ := res.LastInsertId()
	o.ID = int(id)
	json.NewEncoder(w).Encode(o)
}

func updateOverhaul(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var o Overhaul
	if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	query := `UPDATE overhaul SET name=?, location=?, status=?, estimate=?, progress=?, personalia_id=?, material_id=?, inventory_id=?, history_id=? WHERE overhaul_id=?`
	_, err := db.Exec(query, o.Name, o.Location, o.Status, o.Estimate, o.Progress, o.PersonaliaID, o.MaterialID, o.InventoryID, o.HistoryID, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	o.ID, _ = strconv.Atoi(id)
	json.NewEncoder(w).Encode(o)
}

func deleteOverhaul(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	_, err := db.Exec("DELETE FROM overhaul WHERE overhaul_id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func main() {
	connectDB()
	defer db.Close()

	r := mux.NewRouter()
	r.HandleFunc("/api/overhaul", getAllOverhauls).Methods("GET")
	r.HandleFunc("/api/overhaul/{id}", getOverhaulByID).Methods("GET")
	r.HandleFunc("/api/overhaul", createOverhaul).Methods("POST")
	r.HandleFunc("/api/overhaul/{id}", updateOverhaul).Methods("PUT")
	r.HandleFunc("/api/overhaul/{id}", deleteOverhaul).Methods("DELETE")

	log.Println("Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
