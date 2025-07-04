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

type KalibrasiAlat struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"`
	Progress  int       `json:"progress"`
	DueDate   string    `json:"dueDate"`
	CreatedAt time.Time `json:"created_at"`
}

func connectDB() *sql.DB {
	dbUser := getEnv("DB_USER", "root")
	dbPass := getEnv("DB_PASS", "")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "kai_db")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", dbUser, dbPass, dbHost, dbPort, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Gagal konek database:", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatal("DB tidak respons:", err)
	}
	return db
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getKalibrasi(w http.ResponseWriter, r *http.Request) {
	db := connectDB()
	defer db.Close()

	rows, err := db.Query("SELECT id, name, status, progress, due_date, created_at FROM kalibrasi")
	if err != nil {
		http.Error(w, "Gagal ambil data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var data []KalibrasiAlat
	for rows.Next() {
		var k KalibrasiAlat
		if err := rows.Scan(&k.ID, &k.Name, &k.Status, &k.Progress, &k.DueDate, &k.CreatedAt); err != nil {
			http.Error(w, "Gagal baca data", http.StatusInternalServerError)
			return
		}
		data = append(data, k)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func addKalibrasi(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Metode tidak diizinkan", http.StatusMethodNotAllowed)
		return
	}

	var input KalibrasiAlat
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Format JSON salah", http.StatusBadRequest)
		return
	}

	db := connectDB()
	defer db.Close()

	query := "INSERT INTO kalibrasi (name, status, progress, due_date) VALUES (?, ?, ?, ?)"
	_, err := db.Exec(query, input.Name, input.Status, input.Progress, input.DueDate)
	if err != nil {
		http.Error(w, "Gagal simpan data", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprint(w, "Data kalibrasi berhasil ditambahkan")
}

func deleteKalibrasi(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	db := connectDB()
	defer db.Close()

	_, err = db.Exec("DELETE FROM kalibrasi WHERE id = ?", id)
	if err != nil {
		http.Error(w, "Gagal hapus data", http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, "Data berhasil dihapus")
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/kalibrasi/get", getKalibrasi)
	mux.HandleFunc("/api/kalibrasi/add", addKalibrasi)
	mux.HandleFunc("/api/kalibrasi/delete", deleteKalibrasi)

	fmt.Println("Server jalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(mux)))
}
