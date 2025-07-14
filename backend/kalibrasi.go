package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

// Struktur data kalibrasi
type Calibration struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Status   string `json:"status"`
	Progress int    `json:"progress"`
	DueDate  string `json:"dueDate"`
}

// Response standar API
type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

var db *sql.DB

func main() {
	connectDB()

	r := mux.NewRouter()
	r.Use(corsMiddleware)
	r.Use(loggingMiddleware)

	// Endpoint kalibrasi
	r.HandleFunc("/api/calibration", getAllCalibration).Methods("GET")
	r.HandleFunc("/api/calibration", createCalibration).Methods("POST")

	fmt.Println("Server berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

// Koneksi database MySQL
func connectDB() {
	var err error
	dsn := "root:@tcp(localhost:3306)/kai_balai_yasa?parseTime=true"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Gagal koneksi ke database:", err)
	}
	db.SetMaxOpenConns(20)
	db.SetConnMaxLifetime(5 * time.Minute)
	if err := db.Ping(); err != nil {
		log.Fatal("Database tidak dapat dijangkau:", err)
	}
	fmt.Println("Koneksi database berhasil")
}

// Middleware CORS
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// Middleware Logging
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("Request: %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
		log.Printf("Selesai: %s dalam %v", r.URL.Path, time.Since(start))
	})
}

// Fungsi response helper
func sendResponse(w http.ResponseWriter, status int, message string, data interface{}, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	resp := Response{
		Status:  status,
		Message: message,
		Data:    data,
	}
	if err != nil {
		resp.Error = err.Error()
	}
	json.NewEncoder(w).Encode(resp)
}

// Endpoint: GET semua data kalibrasi
func getAllCalibration(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := db.QueryContext(ctx, "SELECT calibration_id, name, status, progress, due_date FROM calibration")
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, "Gagal mengambil data", nil, err)
		return
	}
	defer rows.Close()

	var list []Calibration
	for rows.Next() {
		var c Calibration
		if err := rows.Scan(&c.ID, &c.Name, &c.Status, &c.Progress, &c.DueDate); err != nil {
			sendResponse(w, http.StatusInternalServerError, "Gagal parsing data", nil, err)
			return
		}
		list = append(list, c)
	}

	sendResponse(w, http.StatusOK, "Data kalibrasi berhasil diambil", list, nil)
}

// Endpoint: POST tambah data kalibrasi
func createCalibration(w http.ResponseWriter, r *http.Request) {
	var cal Calibration
	if err := json.NewDecoder(r.Body).Decode(&cal); err != nil {
		sendResponse(w, http.StatusBadRequest, "Format JSON salah", nil, err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := db.ExecContext(ctx,
		"INSERT INTO calibration (name, status, progress, due_date) VALUES (?, ?, ?, ?)",
		cal.Name, cal.Status, cal.Progress, cal.DueDate)
	if err != nil {
		sendResponse(w, http.StatusInternalServerError, "Gagal menyimpan data", nil, err)
		return
	}

	id, _ := result.LastInsertId()
	cal.ID = int(id)
	sendResponse(w, http.StatusCreated, "Data kalibrasi berhasil disimpan", cal, nil)
}
