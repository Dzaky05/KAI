package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// SingleMaterial represents a single material item
type SingleMaterial struct {
	ID           int       `json:"id"`
	JenisBarang  string    `json:"jenisBarang"`
	NamaMaterial string    `json:"namaMaterial"`
	Jumlah       int       `json:"jumlah"`
	Personil     string    `json:"personil"`
	CreatedAt    time.Time `json:"created_at"`
}

// MaterialInput represents the input structure for materials
type MaterialInput struct {
	JenisBarang string           `json:"jenisBarang"`
	Personil    string           `json:"personil"`
	Material    []SingleMaterial `json:"material"`
}

// getEnv gets an environment variable or returns a fallback value
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// connectDB establishes a connection to the database
func connectDB() (*sql.DB, error) {
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPass := getEnv("DB_PASS", "")
	dbName := getEnv("DB_NAME", "kai_db")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPass, dbHost, dbPort, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("database not responding: %v", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
}

// inputMaterial handles the input of new materials
func inputMaterial(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	var input MaterialInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	db, err := connectDB()
	if err != nil {
		log.Printf("Database connection error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		log.Printf("Transaction begin error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	for _, item := range input.Material {
		query := `INSERT INTO material (jenis_barang, nama_material, jumlah, personil, created_at) VALUES (?, ?, ?, ?, ?)`
		_, err := tx.Exec(query, input.JenisBarang, item.NamaMaterial, item.Jumlah, input.Personil, time.Now())
		if err != nil {
			tx.Rollback()
			log.Printf("Insert error: %v", err)
			http.Error(w, "Failed to save data", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		log.Printf("Transaction commit error: %v", err)
		http.Error(w, "Failed to save data", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Data saved successfully"})
}

// getMaterials retrieves all materials
func getMaterials(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	db, err := connectDB()
	if err != nil {
		log.Printf("Database connection error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	rows, err := db.Query(`SELECT id, jenis_barang, nama_material, jumlah, personil, created_at FROM material`)
	if err != nil {
		log.Printf("Query error: %v", err)
		http.Error(w, "Failed to retrieve data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []SingleMaterial
	for rows.Next() {
		var m SingleMaterial
		if err := rows.Scan(&m.ID, &m.JenisBarang, &m.NamaMaterial, &m.Jumlah, &m.Personil, &m.CreatedAt); err != nil {
			log.Printf("Data scan error: %v", err)
			http.Error(w, "Failed to read data", http.StatusInternalServerError)
			return
		}
		result = append(result, m)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Rows error: %v", err)
		http.Error(w, "Failed to process data", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(result)
}

// updateMaterial updates an existing material
func updateMaterial(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var input SingleMaterial
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	db, err := connectDB()
	if err != nil {
		log.Printf("Database connection error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	query := `UPDATE material SET jenis_barang=?, nama_material=?, jumlah=?, personil=? WHERE id=?`
	result, err := db.Exec(query, input.JenisBarang, input.NamaMaterial, input.Jumlah, input.Personil, id)
	if err != nil {
		log.Printf("Update error: %v", err)
		http.Error(w, "Failed to update data", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Rows affected error: %v", err)
		http.Error(w, "Failed to verify update", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "No record found with given ID", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Data updated successfully"})
}

// deleteMaterial deletes a material
func deleteMaterial(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	db, err := connectDB()
	if err != nil {
		log.Printf("Database connection error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	result, err := db.Exec("DELETE FROM material WHERE id = ?", id)
	if err != nil {
		log.Printf("Delete error: %v", err)
		http.Error(w, "Failed to delete data", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Rows affected error: %v", err)
		http.Error(w, "Failed to verify deletion", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "No record found with given ID", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Data deleted successfully"})
}

// enableCORS enables Cross-Origin Resource Sharing
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/material/input", inputMaterial)   // POST
	mux.HandleFunc("/api/material/get", getMaterials)      // GET
	mux.HandleFunc("/api/material/update", updateMaterial) // PUT
	mux.HandleFunc("/api/material/delete", deleteMaterial) // DELETE

	server := &http.Server{
		Addr:         ":8080",
		Handler:      enableCORS(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Println("Server running on http://localhost:8080")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}
