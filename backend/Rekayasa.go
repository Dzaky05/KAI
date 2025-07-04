package main

import (
	"encoding/json"
	"log"
	"net/http"
	"database/sql"

	_ "github.com/go-sql-driver/mysql"


)

type Project struct {
	ID       int      `json:"id"`
	Name     string   `json:"name"`
	Status   string   `json:"status"`
	Team     []string `json:"team"`
	Deadline string   `json:"deadline"`
	Progress int      `json:"progress"`
}

var projects = []Project{
	{
		ID:       1,
		Name:     "Pengembangan Sistem Kontrol",
		Status:   "Dalam Pengerjaan",
		Team:     []string{"BS", "AW", "CD"},
		Deadline: "2023-12-31",
		Progress: 65,
	},
	{
		ID:       2,
		Name:     "Optimasi Produksi",
		Status:   "Selesai",
		Team:     []string{"DP", "ES"},
		Deadline: "2023-10-15",
		Progress: 100,
	},
	{
		ID:       3,
		Name:     "Desain Komponen Baru",
		Status:   "Perencanaan",
		Team:     []string{"BS", "ES"},
		Deadline: "2024-02-28"
		Progress: 15,
	},
}

func getProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

func main() {
	http.HandleFunc("/api/projects", getProjects)

	log.Println("Server berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
