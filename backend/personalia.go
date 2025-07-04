package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	_ "github.com/go-sql-driver/mysql"
)

type Education struct {
	ID         int    `json:"id"`
	Degree     string `json:"degree"`
	University string `json:"university"`
	Year       string `json:"year"`
}

type Experience struct {
	ID       int    `json:"id"`
	Position string `json:"position"`
	Company  string `json:"company"`
	Period   string `json:"period"`
}

type Profile struct {
	Name       string       `json:"name"`
	Position   string       `json:"position"`
	Email      string       `json:"email"`
	Phone      string       `json:"phone"`
	Address    string       `json:"address"`
	Bio        string       `json:"bio"`
	Education  []Education  `json:"education"`
	Experience []Experience `json:"experience"`
}

var (
	profile = Profile{
		Name:     "Asep Hidayat S.Kom M.Kom",
		Position: "Production Manager",
		Email:    "john.doe@kai.co.id",
		Phone:    "+62 812-3456-7890",
		Address:  "Jl. Kereta Api No. 1, Jakarta",
		Bio:      "Professional with 10+ years experience in railway production management",
		Education: []Education{
			{ID: 1, Degree: "Bachelor of Engineering", University: "Institut Teknologi Bandung", Year: "2005-2009"},
			{ID: 2, Degree: "Master of Business Administration", University: "Universitas Indonesia", Year: "2011-2013"},
		},
		Experience: []Experience{
			{ID: 1, Position: "Production Supervisor", Company: "PT KAI", Period: "2010-2015"},
			{ID: 2, Position: "Production Manager", Company: "PT KAI Balai Yasa", Period: "2015-Present"},
		},
	}
	mutex sync.Mutex
)

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func getProfile(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}

	w.Header().Set("Content-Type", "application/json")
	mutex.Lock()
	defer mutex.Unlock()
	if err := json.NewEncoder(w).Encode(profile); err != nil {
		http.Error(w, "Failed to encode profile", http.StatusInternalServerError)
	}
}

func updateProfile(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}

	w.Header().Set("Content-Type", "application/json")
	mutex.Lock()
	defer mutex.Unlock()

	var updatedProfile Profile
	if err := json.NewDecoder(r.Body).Decode(&updatedProfile); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	profile = updatedProfile

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(profile); err != nil {
		http.Error(w, "Failed to encode updated profile", http.StatusInternalServerError)
	}
}

func main() {
	http.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getProfile(w, r)
		case http.MethodPut:
			updateProfile(w, r)
		case http.MethodOptions:
			enableCORS(w)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	log.Println("Personalia API running on http://localhost:8081")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
