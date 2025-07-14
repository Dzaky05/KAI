package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

type Inventory struct {
	ID        int    `json:"id"`
	Nama      string `json:"name"`
	Kuantitas int    `json:"quantity"`
	Lokasi    string `json:"location"`
	Status    string `json:"status"`
	KodeItem  string `json:"itemCode"`
}

var db *sql.DB

func koneksiDatabase() {
	var err error
	db, err = sql.Open("mysql", "root:@tcp(localhost:3306)/kai_db") // ganti user, pass, db jika perlu
	if err != nil {
		log.Fatal("Gagal koneksi database: ", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatal("Gagal ping database: ", err)
	}
}

func ambilSemuaInventaris(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, quantity, location, status, itemCode FROM inventory")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var hasil []Inventory
	for rows.Next() {
		var i Inventory
		if err := rows.Scan(&i.ID, &i.Nama, &i.Kuantitas, &i.Lokasi, &i.Status, &i.KodeItem); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		hasil = append(hasil, i)
	}
	json.NewEncoder(w).Encode(hasil)
}

func ambilInventarisByID(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var i Inventory
	err := db.QueryRow("SELECT id, name, quantity, location, status, itemCode FROM inventory WHERE id=?", id).
		Scan(&i.ID, &i.Nama, &i.Kuantitas, &i.Lokasi, &i.Status, &i.KodeItem)
	if err == sql.ErrNoRows {
		http.Error(w, "Data tidak ditemukan", 404)
		return
	} else if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(i)
}

func tambahInventaris(w http.ResponseWriter, r *http.Request) {
	var i Inventory
	if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	_, err := db.Exec("INSERT INTO inventory (name, quantity, location, status, itemCode) VALUES (?, ?, ?, ?, ?)",
		i.Nama, i.Kuantitas, i.Lokasi, i.Status, i.KodeItem)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Berhasil ditambahkan"})
}

func perbaruiInventaris(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var i Inventory
	if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	_, err := db.Exec("UPDATE inventory SET name=?, quantity=?, location=?, status=?, itemCode=? WHERE id=?",
		i.Nama, i.Kuantitas, i.Lokasi, i.Status, i.KodeItem, id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Berhasil diperbarui"})
}

func hapusInventaris(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	_, err := db.Exec("DELETE FROM inventory WHERE id=?", id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func main() {
	koneksiDatabase()
	r := mux.NewRouter()

	r.HandleFunc("/api/inventory", ambilSemuaInventaris).Methods("GET")
	r.HandleFunc("/api/inventory/{id}", ambilInventarisByID).Methods("GET")
	r.HandleFunc("/api/inventory", tambahInventaris).Methods("POST")
	r.HandleFunc("/api/inventory/{id}", perbaruiInventaris).Methods("PUT")
	r.HandleFunc("/api/inventory/{id}", hapusInventaris).Methods("DELETE")

	log.Println("Server berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
