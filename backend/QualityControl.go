package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

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

var stockData []StockItem
var currentID = 6

func main() {
	r := mux.NewRouter()

	// Routes
	r.HandleFunc("/api/stock", GetAllStock).Methods("GET")
	r.HandleFunc("/api/stock/{id}", GetStockByID).Methods("GET")
	r.HandleFunc("/api/stock", CreateStock).Methods("POST")
	r.HandleFunc("/api/stock/{id}", UpdateStock).Methods("PUT")
	r.HandleFunc("/api/stock/{id}", DeleteStock).Methods("DELETE")

	log.Println("Server started at :8080")
	http.ListenAndServe(":8080", r)
}

func GetAllStock(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stockData)
}

func GetStockByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	for _, item := range stockData {
		if item.ID == id {
			json.NewEncoder(w).Encode(item)
			return
		}
	}
	http.NotFound(w, r)
}

func CreateStock(w http.ResponseWriter, r *http.Request) {
	var newItem StockItem
	json.NewDecoder(r.Body).Decode(&newItem)

	currentID++
	newItem.ID = currentID
	newItem.LastUpdated = time.Now().Format("2006-01-02")
	stockData = append(stockData, newItem)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newItem)
}

func UpdateStock(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	for i, item := range stockData {
		if item.ID == id {
			json.NewDecoder(r.Body).Decode(&stockData[i])
			stockData[i].ID = id
			stockData[i].LastUpdated = time.Now().Format("2006-01-02")
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(stockData[i])
			return
		}
	}
	http.NotFound(w, r)
}

func DeleteStock(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	for i, item := range stockData {
		if item.ID == id {
			stockData = append(stockData[:i], stockData[i+1:]...)
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}
	http.NotFound(w, r)
}
