package stockproduction

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

var db *sql.DB

func connectDB() {
	var err error
	db, err = sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/kai_balai_yasa")
	if err != nil {
		log.Fatal("Database connection error:", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal("Database not responding:", err)
	}
}

type StockItem struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Quantity    int    `json:"quantity"`
	MinStock    int    `json:"minStock"`
	Location    string `json:"location"`
	Category    string `json:"category"`
	Unit        string `json:"unit"`
	LastUpdated string `json:"lastUpdated"`
}

func main() {
	connectDB()
	r := mux.NewRouter()

	r.HandleFunc("/api/stock", GetAllStock).Methods("GET")
	r.HandleFunc("/api/stock/{id}", GetStockByID).Methods("GET")
	r.HandleFunc("/api/stock", CreateStock).Methods("POST")
	r.HandleFunc("/api/stock/{id}", UpdateStock).Methods("PUT")
	r.HandleFunc("/api/stock/{id}", DeleteStock).Methods("DELETE")

	log.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

// ======================== HANDLERS ========================

func GetAllStock(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, code, quantity, min_stock, location, category, unit, last_updated FROM stock_production")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var items []StockItem
	for rows.Next() {
		var s StockItem
		var lastUpdated time.Time
		if err := rows.Scan(&s.ID, &s.Name, &s.Code, &s.Quantity, &s.MinStock, &s.Location, &s.Category, &s.Unit, &lastUpdated); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		s.LastUpdated = lastUpdated.Format("2006-01-02 15:04:05")
		items = append(items, s)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func GetStockByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var s StockItem
	var lastUpdated time.Time

	err := db.QueryRow("SELECT id, name, code, quantity, min_stock, location, category, unit, last_updated FROM stock_production WHERE id = ?", id).
		Scan(&s.ID, &s.Name, &s.Code, &s.Quantity, &s.MinStock, &s.Location, &s.Category, &s.Unit, &lastUpdated)
	if err == sql.ErrNoRows {
		http.Error(w, "Item not found", 404)
		return
	} else if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	s.LastUpdated = lastUpdated.Format("2006-01-02 15:04:05")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func CreateStock(w http.ResponseWriter, r *http.Request) {
	var s StockItem
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	now := time.Now()
	result, err := db.Exec("INSERT INTO stock_production (name, code, quantity, min_stock, location, category, unit, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		s.Name, s.Code, s.Quantity, s.MinStock, s.Location, s.Category, s.Unit, now)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	insertID, _ := result.LastInsertId()
	s.ID = int(insertID)
	s.LastUpdated = now.Format("2006-01-02 15:04:05")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(s)
}

func UpdateStock(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var s StockItem
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	now := time.Now()
	_, err := db.Exec("UPDATE stock_production SET name=?, code=?, quantity=?, min_stock=?, location=?, category=?, unit=?, last_updated=? WHERE id=?",
		s.Name, s.Code, s.Quantity, s.MinStock, s.Location, s.Category, s.Unit, now, id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	s.ID, _ = strconv.Atoi(id)
	s.LastUpdated = now.Format("2006-01-02 15:04:05")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func DeleteStock(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	result, err := db.Exec("DELETE FROM stock_production WHERE id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Item not found", 404)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
