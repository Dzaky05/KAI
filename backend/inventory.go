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

type InventoryItem struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Quantity  int       `json:"quantity"`
	Location  string    `json:"location"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

func connectDB() *sql.DB {
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPass := getEnv("DB_PASS", "")
	dbName := getEnv("DB_NAME", "kai_db")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("DB connection failed:", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal("DB not responding:", err)
	}
	return db
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// GET /api/inventory
func getInventory(w http.ResponseWriter, r *http.Request) {
	db := connectDB()
	defer db.Close()

	rows, err := db.Query(`SELECT id, name, quantity, location, status, created_at FROM inventory`)
	if err != nil {
		http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var data []InventoryItem
	for rows.Next() {
		var item InventoryItem
		if err := rows.Scan(&item.ID, &item.Name, &item.Quantity, &item.Location, &item.Status, &item.CreatedAt); err != nil {
			http.Error(w, "Failed to read row", http.StatusInternalServerError)
			return
		}
		data = append(data, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// POST /api/inventory
func addInventory(w http.ResponseWriter, r *http.Request) {
	var item InventoryItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	db := connectDB()
	defer db.Close()

	query := `INSERT INTO inventory (name, quantity, location, status) VALUES (?, ?, ?, ?)`
	_, err := db.Exec(query, item.Name, item.Quantity, item.Location, item.Status)
	if err != nil {
		http.Error(w, "Failed to save to DB", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprint(w, "Inventory item added successfully")
}

// PUT /api/inventory?id=1
func updateInventory(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var item InventoryItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	db := connectDB()
	defer db.Close()

	query := `UPDATE inventory SET name=?, quantity=?, location=?, status=? WHERE id=?`
	_, err = db.Exec(query, item.Name, item.Quantity, item.Location, item.Status, id)
	if err != nil {
		http.Error(w, "Failed to update DB", http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, "Inventory item updated successfully")
}

// DELETE /api/inventory?id=1
func deleteInventory(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	db := connectDB()
	defer db.Close()

	_, err = db.Exec("DELETE FROM inventory WHERE id=?", id)
	if err != nil {
		http.Error(w, "Failed to delete from DB", http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, "Inventory item deleted successfully")
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/inventory", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			getInventory(w, r)
		case "POST":
			addInventory(w, r)
		case "PUT":
			updateInventory(w, r)
		case "DELETE":
			deleteInventory(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	fmt.Println("Inventory API running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(mux)))
}
