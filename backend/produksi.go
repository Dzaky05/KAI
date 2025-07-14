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

type Production struct {
	ID        int            `json:"id"`
	Name      string         `json:"name"`
	Target    int            `json:"target"`
	Completed int            `json:"completed"`
	Status    string         `json:"status"`
	StartDate string         `json:"startDate"`
	EndDate   string         `json:"endDate"`
	Personnel []Personnel    `json:"personnel"`
	Materials []Material     `json:"materials"`
	Progress  []ProgressNote `json:"progress"`
}

type Personnel struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Material struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Qty    int    `json:"qty"`
	Harga  int    `json:"harga"`
	Satuan string `json:"satuan"`
}

type ProgressNote struct {
	ID        int    `json:"id"`
	Date      string `json:"date"`
	Completed int    `json:"completed"`
	Notes     string `json:"notes"`
}

// Request structs untuk input data
type CreateProductionRequest struct {
	Name      string `json:"name"`
	Target    int    `json:"target"`
	Status    string `json:"status"`
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
	Personnel []int  `json:"personnel"` // Array of personnel IDs
	Materials []int  `json:"materials"` // Array of material IDs
}

type UpdateProgressRequest struct {
	Date      string `json:"date"`
	Completed int    `json:"completed"`
	Notes     string `json:"notes"`
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

// GET all productions
func getAllProductions(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, name, target, completed, status, start_date, end_date FROM produksi")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var productions []Production
	for rows.Next() {
		var p Production
		err := rows.Scan(&p.ID, &p.Name, &p.Target, &p.Completed, &p.Status, &p.StartDate, &p.EndDate)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		p.Personnel = getPersonnelByProductionID(p.ID)
		p.Materials = getMaterialsByProductionID(p.ID)
		p.Progress = getProgressByProductionID(p.ID)
		productions = append(productions, p)
	}

	json.NewEncoder(w).Encode(productions)
}

// GET single production by ID
func getProductionByID(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid production ID", http.StatusBadRequest)
		return
	}

	var p Production
	err = db.QueryRow("SELECT id, name, target, completed, status, start_date, end_date FROM produksi WHERE id = ?", id).
		Scan(&p.ID, &p.Name, &p.Target, &p.Completed, &p.Status, &p.StartDate, &p.EndDate)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Production not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	p.Personnel = getPersonnelByProductionID(p.ID)
	p.Materials = getMaterialsByProductionID(p.ID)
	p.Progress = getProgressByProductionID(p.ID)

	json.NewEncoder(w).Encode(p)
}

// POST create new production
func createProduction(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	var req CreateProductionRequest
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

	// Insert production
	result, err := tx.Exec(`INSERT INTO produksi (name, target, completed, status, start_date, end_date) 
		VALUES (?, ?, 0, ?, ?, ?)`, req.Name, req.Target, req.Status, req.StartDate, req.EndDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	prodID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert personnel assignments
	for _, personnelID := range req.Personnel {
		_, err := tx.Exec(`INSERT INTO produksi_team (produksi_id, personalia_id) VALUES (?, ?)`, prodID, personnelID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Insert material assignments
	for _, materialID := range req.Materials {
		_, err := tx.Exec(`INSERT INTO produksi_materials (produksi_id, material_id) VALUES (?, ?)`, prodID, materialID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return created production
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Production created successfully",
		"id":      prodID,
	})
}

// PUT update production
func updateProduction(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid production ID", http.StatusBadRequest)
		return
	}

	var req CreateProductionRequest
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

	// Update production
	_, err = tx.Exec(`UPDATE produksi SET name = ?, target = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?`,
		req.Name, req.Target, req.Status, req.StartDate, req.EndDate, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete existing personnel assignments
	_, err = tx.Exec(`DELETE FROM produksi_team WHERE produksi_id = ?`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete existing material assignments
	_, err = tx.Exec(`DELETE FROM produksi_materials WHERE produksi_id = ?`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Insert new personnel assignments
	for _, personnelID := range req.Personnel {
		_, err := tx.Exec(`INSERT INTO produksi_team (produksi_id, personalia_id) VALUES (?, ?)`, id, personnelID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Insert new material assignments
	for _, materialID := range req.Materials {
		_, err := tx.Exec(`INSERT INTO produksi_materials (produksi_id, material_id) VALUES (?, ?)`, id, materialID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Production updated successfully"})
}

// DELETE production
func deleteProduction(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid production ID", http.StatusBadRequest)
		return
	}

	// Start transaction
	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Delete related records first (foreign key constraints)
	_, err = tx.Exec(`DELETE FROM progress WHERE produksi_id = ?`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(`DELETE FROM produksi_team WHERE produksi_id = ?`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(`DELETE FROM produksi_materials WHERE produksi_id = ?`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete production
	_, err = tx.Exec(`DELETE FROM produksi WHERE id = ?`, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Production deleted successfully"})
}

// POST add progress note
func addProgressNote(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	prodID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid production ID", http.StatusBadRequest)
		return
	}

	var req UpdateProgressRequest
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

	// Insert progress note
	_, err = tx.Exec(`INSERT INTO progress (produksi_id, date, completed, notes) VALUES (?, ?, ?, ?)`,
		prodID, req.Date, req.Completed, req.Notes)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update production completed value
	_, err = tx.Exec(`UPDATE produksi SET completed = ? WHERE id = ?`, req.Completed, prodID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Progress note added successfully"})
}

// GET all personnel
func getAllPersonnel(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, name FROM personalia")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var personnel []Personnel
	for rows.Next() {
		var p Personnel
		err := rows.Scan(&p.ID, &p.Name)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		personnel = append(personnel, p)
	}

	json.NewEncoder(w).Encode(personnel)
}

// GET all materials
func getAllMaterials(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, name, qty, harga, satuan FROM materials")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var materials []Material
	for rows.Next() {
		var m Material
		err := rows.Scan(&m.ID, &m.Name, &m.Qty, &m.Harga, &m.Satuan)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		materials = append(materials, m)
	}

	json.NewEncoder(w).Encode(materials)
}

func getPersonnelByProductionID(prodID int) []Personnel {
	rows, err := db.Query(`SELECT p.id, p.name FROM personalia p JOIN produksi_team pt ON p.id = pt.personalia_id WHERE pt.produksi_id = ?`, prodID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var personnel []Personnel
	for rows.Next() {
		var p Personnel
		rows.Scan(&p.ID, &p.Name)
		personnel = append(personnel, p)
	}
	return personnel
}

func getMaterialsByProductionID(prodID int) []Material {
	rows, err := db.Query(`SELECT m.id, m.name, m.qty, m.harga, m.satuan FROM materials m JOIN produksi_materials pm ON m.id = pm.material_id WHERE pm.produksi_id = ?`, prodID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var materials []Material
	for rows.Next() {
		var m Material
		rows.Scan(&m.ID, &m.Name, &m.Qty, &m.Harga, &m.Satuan)
		materials = append(materials, m)
	}
	return materials
}

func getProgressByProductionID(prodID int) []ProgressNote {
	rows, err := db.Query(`SELECT id, date, completed, notes FROM progress WHERE produksi_id = ? ORDER BY date DESC`, prodID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var notes []ProgressNote
	for rows.Next() {
		var p ProgressNote
		rows.Scan(&p.ID, &p.Date, &p.Completed, &p.Notes)
		notes = append(notes, p)
	}
	return notes
}

func main() {
	initDB()
	defer db.Close()

	r := mux.NewRouter()

	// Use CORS middleware
	r.Use(corsMiddleware)

	// Production routes
	r.HandleFunc("/api/produksi", getAllProductions).Methods("GET")
	r.HandleFunc("/api/produksi/{id}", getProductionByID).Methods("GET")
	r.HandleFunc("/api/produksi", createProduction).Methods("POST")
	r.HandleFunc("/api/produksi/{id}", updateProduction).Methods("PUT")
	r.HandleFunc("/api/produksi/{id}", deleteProduction).Methods("DELETE")

	// Progress routes
	r.HandleFunc("/api/produksi/{id}/progress", addProgressNote).Methods("POST")

	// Master data routes
	r.HandleFunc("/api/personalia", getAllPersonnel).Methods("GET")
	r.HandleFunc("/api/materials", getAllMaterials).Methods("GET")

	fmt.Println("Server running on :8080")
	fmt.Println("Available endpoints:")
	fmt.Println("GET    /api/produksi           - Get all productions")
	fmt.Println("GET    /api/produksi/{id}      - Get production by ID")
	fmt.Println("POST   /api/produksi           - Create new production")
	fmt.Println("PUT    /api/produksi/{id}      - Update production")
	fmt.Println("DELETE /api/produksi/{id}      - Delete production")
	fmt.Println("POST   /api/produksi/{id}/progress - Add progress note")
	fmt.Println("GET    /api/personalia         - Get all personnel")
	fmt.Println("GET    /api/materials          - Get all materials")

	log.Fatal(http.ListenAndServe(":8080", r))
}
