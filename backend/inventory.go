package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv" // Import strconv untuk konversi ID

	_ "github.com/go-sql-driver/mysql" // Driver database MySQL
	"github.com/gorilla/mux"           // Router HTTP
)

// Inventory mewakili struktur data untuk item inventaris
type Inventory struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Quantity int    `json:"quantity"`
	Location string `json:"location"`
	Status   string `json:"status"`
	ItemCode string `json:"itemCode"`
	// Jika ada foreign key, tambahkan di sini, contoh:
	// LocationID int `json:"locationId"`
	// Location   Location `json:"location"` // Jika ingin embed struct Location
}

// Jika ada tabel Lokasi terpisah
// type Location struct {
// 	ID   int    `json:"id"`
// 	Name string `json:"name"`
// }

var db *sql.DB

// initDatabase melakukan koneksi awal ke database
func initDatabase() {
	var err error
	// Pastikan detail koneksi sesuai dengan konfigurasi database Anda
	// Ganti "root:@tcp(localhost:3306)/kai_db" jika perlu
	db, err = sql.Open("mysql", "root:@tcp(localhost:3306)/kai_balai_yasa?parseTime=true")
	if err != nil {
		log.Fatalf("Gagal koneksi database: %v", err)
	}
	if err = db.Ping(); err != nil {
		log.Fatalf("Gagal ping database: %v", err)
	}
	log.Println("Koneksi database berhasil!")
}

// getAllInventory mengambil semua item inventaris dari database
func getAllInventory(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, quantity, location, status, itemCode FROM inventory")
	if err != nil {
		log.Printf("Error saat mengambil data inventaris: %v", err)
		http.Error(w, "Gagal mengambil data inventaris", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var inventoryItems []Inventory
	for rows.Next() {
		var item Inventory
		if err := rows.Scan(&item.ID, &item.Name, &item.Quantity, &item.Location, &item.Status, &item.ItemCode); err != nil {
			log.Printf("Error saat scan row inventaris: %v", err)
			http.Error(w, "Gagal memproses data inventaris", http.StatusInternalServerError)
			return
		}
		inventoryItems = append(inventoryItems, item)
	}

	// Periksa error setelah loop rows.Next()
	if err = rows.Err(); err != nil {
		log.Printf("Error setelah iterasi rows inventaris: %v", err)
		http.Error(w, "Terjadi kesalahan saat membaca data inventaris", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(inventoryItems)
}

// getInventoryByID mengambil item inventaris berdasarkan ID
func getInventoryByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	idStr := params["id"]

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inventaris tidak valid", http.StatusBadRequest)
		return
	}

	var item Inventory
	err = db.QueryRow("SELECT id, name, quantity, location, status, itemCode FROM inventory WHERE id=?", id).
		Scan(&item.ID, &item.Name, &item.Quantity, &item.Location, &item.Status, &item.ItemCode)

	if err == sql.ErrNoRows {
		http.Error(w, "Data inventaris tidak ditemukan", http.StatusNotFound)
		return
	} else if err != nil {
		log.Printf("Error saat mengambil inventaris dengan ID %d: %v", id, err)
		http.Error(w, "Gagal mengambil data inventaris", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

// createInventory menambahkan item inventaris baru ke database
func createInventory(w http.ResponseWriter, r *http.Request) {
	var newItem Inventory
	if err := json.NewDecoder(r.Body).Decode(&newItem); err != nil {
		http.Error(w, "Format data tidak valid", http.StatusBadRequest)
		return
	}

	// Lakukan validasi data jika diperlukan
	if newItem.Name == "" || newItem.Quantity <= 0 || newItem.Location == "" || newItem.Status == "" || newItem.ItemCode == "" {
		http.Error(w, "Semua field (name, quantity, location, status, itemCode) wajib diisi dan kuantitas harus > 0", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("INSERT INTO inventory (name, quantity, location, status, itemCode) VALUES (?, ?, ?, ?, ?)",
		newItem.Name, newItem.Quantity, newItem.Location, newItem.Status, newItem.ItemCode)
	if err != nil {
		log.Printf("Error saat menambahkan inventaris: %v", err)
		http.Error(w, "Gagal menambahkan item inventaris", http.StatusInternalServerError)
		return
	}

	// Ambil ID yang baru saja dibuat
	id, err := result.LastInsertId()
	if err != nil {
		log.Printf("Error saat mendapatkan LastInsertId: %v", err)
		// Mungkin masih berhasil menyimpan, tapi gagal mendapatkan ID
		// Anda bisa memilih untuk mengembalikan pesan sukses tanpa ID atau error
	} else {
		newItem.ID = int(id) // Set ID ke item baru
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newItem) // Kirim kembali item yang baru ditambahkan (termasuk ID)
}

// updateInventory memperbarui item inventaris di database berdasarkan ID
func updateInventory(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	idStr := params["id"]

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inventaris tidak valid", http.StatusBadRequest)
		return
	}

	var updatedItem Inventory
	if err := json.NewDecoder(r.Body).Decode(&updatedItem); err != nil {
		http.Error(w, "Format data tidak valid", http.StatusBadRequest)
		return
	}

	// Lakukan validasi data jika diperlukan
	if updatedItem.Name == "" || updatedItem.Quantity < 0 || updatedItem.Location == "" || updatedItem.Status == "" || updatedItem.ItemCode == "" {
		http.Error(w, "Semua field (name, quantity, location, status, itemCode) wajib diisi", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("UPDATE inventory SET name=?, quantity=?, location=?, status=?, itemCode=? WHERE id=?",
		updatedItem.Name, updatedItem.Quantity, updatedItem.Location, updatedItem.Status, updatedItem.ItemCode, id)
	if err != nil {
		log.Printf("Error saat memperbarui inventaris dengan ID %d: %v", id, err)
		http.Error(w, "Gagal memperbarui item inventaris", http.StatusInternalServerError)
		return
	}

	// Periksa apakah ada row yang terpengaruh (item dengan ID tersebut ada)
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error saat mendapatkan RowsAffected: %v", err)
		// Lanjutkan, mungkin update berhasil tapi gagal cek affected rows
	} else if rowsAffected == 0 {
		http.Error(w, "Item inventaris tidak ditemukan", http.StatusNotFound)
		return
	}

	updatedItem.ID = id // Set ID item yang diperbarui

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedItem) // Kirim kembali item yang diperbarui
}

// deleteInventory menghapus item inventaris dari database berdasarkan ID
func deleteInventory(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	idStr := params["id"]

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inventaris tidak valid", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM inventory WHERE id=?", id)
	if err != nil {
		log.Printf("Error saat menghapus inventaris dengan ID %d: %v", id, err)
		http.Error(w, "Gagal menghapus item inventaris", http.StatusInternalServerError)
		return
	}

	// Periksa apakah ada row yang terpengaruh (item dengan ID tersebut ada)
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("Error saat mendapatkan RowsAffected: %v", err)
		// Lanjutkan, mungkin delete berhasil tapi gagal cek affected rows
	} else if rowsAffected == 0 {
		http.Error(w, "Item inventaris tidak ditemukan", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204 No Content untuk sukses penghapusan
}

func main() {
	initDatabase() // Panggil fungsi inisialisasi database

	r := mux.NewRouter()

	// Definisikan endpoint API
	r.HandleFunc("/api/inventory", getAllInventory).Methods("GET")
	r.HandleFunc("/api/inventory/{id}", getInventoryByID).Methods("GET")
	r.HandleFunc("/api/inventory", createInventory).Methods("POST")
	r.HandleFunc("/api/inventory/{id}", updateInventory).Methods("PUT")
	r.HandleFunc("/api/inventory/{id}", deleteInventory).Methods("DELETE")

	log.Println("Server berjalan di http://localhost:8080")
	// Menambahkan header CORS sederhana untuk development
	// Untuk production, konfigurasikan CORS dengan lebih aman
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Izinkan dari semua origin (untuk development)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight OPTIONS requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		r.ServeHTTP(w, r)
	})

	log.Fatal(http.ListenAndServe(":8080", handler)) // Gunakan handler yang dilengkapi CORS
}
