package main

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// QCItem represents a quality control item
type QCItem struct {
	ID         string `json:"id"`
	Product    string `json:"product"`
	Batch      string `json:"batch"`
	Status     string `json:"status"`
	Tested     int    `json:"tested"`
	Passed     int    `json:"passed"`
	Date       string `json:"date"`
	Department string `json:"department"`
}

// QCData holds all QC data organized by department
type QCData struct {
	Production  []QCItem `json:"production"`
	Overhaul    []QCItem `json:"overhaul"`
	Engineering []QCItem `json:"engineering"`
	Stock       []QCItem `json:"stock"`
}

// Statistics holds QC statistics
type Statistics struct {
	TotalQC         int `json:"total_qc"`
	Lulus           int `json:"lulus"`
	TidakLulus      int `json:"tidak_lulus"`
	DalamPerbaikan  int `json:"dalam_perbaikan"`
	DalamProses     int `json:"dalam_proses"`
	TotalTested     int `json:"total_tested"`
	TotalPassed     int `json:"total_passed"`
	OverallPassRate int `json:"overall_pass_rate"`
}

// Global data storage (in production, use database)
var qcData = QCData{
	Production: []QCItem{
		{ID: "PRD-001", Product: "Radio Lokomotif", Batch: "BATCH-2023-11", Status: "Lulus", Tested: 25, Passed: 25, Date: "2023-11-05", Department: "Production"},
		{ID: "PRD-002", Product: "Way Station", Batch: "BATCH-2023-10", Status: "Lulus", Tested: 30, Passed: 28, Date: "2023-10-28", Department: "Production"},
		{ID: "PRD-003", Product: "Sentranik", Batch: "BATCH-2023-11", Status: "Dalam Proses", Tested: 15, Passed: 12, Date: "2023-11-12", Department: "Production"},
	},
	Overhaul: []QCItem{
		{ID: "OVH-001", Product: "Point Machine A", Batch: "BATCH-2023-09", Status: "Tidak Lulus", Tested: 20, Passed: 15, Date: "2023-09-20", Department: "Overhaul"},
		{ID: "OVH-002", Product: "Point Machine B", Batch: "BATCH-2023-10", Status: "Lulus", Tested: 18, Passed: 18, Date: "2023-10-15", Department: "Overhaul"},
	},
	Engineering: []QCItem{
		{ID: "ENG-001", Product: "Control Panel", Batch: "BATCH-2023-11", Status: "Lulus", Tested: 10, Passed: 9, Date: "2023-11-08", Department: "Engineering"},
		{ID: "ENG-002", Product: "Signal System", Batch: "BATCH-2023-10", Status: "Dalam Proses", Tested: 12, Passed: 10, Date: "2023-10-30", Department: "Engineering"},
	},
	Stock: []QCItem{
		{ID: "STK-001", Product: "Battery Pack", Batch: "BATCH-2023-11", Status: "Lulus", Tested: 50, Passed: 48, Date: "2023-11-10", Department: "Stock"},
		{ID: "STK-002", Product: "Cable Set", Batch: "BATCH-2023-09", Status: "Tidak Lulus", Tested: 30, Passed: 25, Date: "2023-09-25", Department: "Stock"},
	},
}

// GetAllData returns all QC data combined
func GetAllData() []QCItem {
	var allData []QCItem
	allData = append(allData, qcData.Production...)
	allData = append(allData, qcData.Overhaul...)
	allData = append(allData, qcData.Engineering...)
	allData = append(allData, qcData.Stock...)
	return allData
}

// GetDataByDepartment returns QC data for specific department
func GetDataByDepartment(department string) []QCItem {
	switch strings.ToLower(department) {
	case "production":
		return qcData.Production
	case "overhaul":
		return qcData.Overhaul
	case "engineering":
		return qcData.Engineering
	case "stock":
		return qcData.Stock
	default:
		return GetAllData()
	}
}

// CalculateStatistics calculates statistics for given data
func CalculateStatistics(data []QCItem) Statistics {
	stats := Statistics{}
	stats.TotalQC = len(data)

	for _, item := range data {
		stats.TotalTested += item.Tested
		stats.TotalPassed += item.Passed

		switch item.Status {
		case "Lulus":
			stats.Lulus++
		case "Tidak Lulus":
			stats.TidakLulus++
		case "Dalam Perbaikan":
			stats.DalamPerbaikan++
		case "Dalam Proses":
			stats.DalamProses++
		}
	}

	if stats.TotalTested > 0 {
		stats.OverallPassRate = (stats.TotalPassed * 100) / stats.TotalTested
	}

	return stats
}

// FilterData filters QC data based on search term
func FilterData(data []QCItem, searchTerm string) []QCItem {
	if searchTerm == "" {
		return data
	}

	var filtered []QCItem
	searchLower := strings.ToLower(searchTerm)

	for _, item := range data {
		if strings.Contains(strings.ToLower(item.ID), searchLower) ||
			strings.Contains(strings.ToLower(item.Product), searchLower) ||
			strings.Contains(strings.ToLower(item.Batch), searchLower) ||
			strings.Contains(strings.ToLower(item.Status), searchLower) ||
			strings.Contains(strings.ToLower(item.Department), searchLower) {
			filtered = append(filtered, item)
		}
	}

	return filtered
}

// GetPassRate calculates pass rate for an item
func GetPassRate(tested, passed int) int {
	if tested == 0 {
		return 0
	}
	return (passed * 100) / tested
}

// Routes and handlers
func main() {
	r := gin.Default()

	// Load HTML templates
	r.LoadHTMLGlob("templates/*")

	// Static files
	r.Static("/static", "./static")

	// Main dashboard route
	r.GET("/", func(c *gin.Context) {
		department := c.DefaultQuery("department", "all")
		search := c.DefaultQuery("search", "")

		data := GetDataByDepartment(department)
		filteredData := FilterData(data, search)
		stats := CalculateStatistics(filteredData)

		c.HTML(http.StatusOK, "dashboard.html", gin.H{
			"title":      "Quality Control Dashboard",
			"department": department,
			"search":     search,
			"data":       filteredData,
			"stats":      stats,
		})
	})

	// API routes
	api := r.Group("/api")
	{
		// Get QC data
		api.GET("/qc", func(c *gin.Context) {
			department := c.DefaultQuery("department", "all")
			search := c.DefaultQuery("search", "")

			data := GetDataByDepartment(department)
			filteredData := FilterData(data, search)

			c.JSON(http.StatusOK, gin.H{
				"data":  filteredData,
				"stats": CalculateStatistics(filteredData),
			})
		})

		// Add new QC item
		api.POST("/qc", func(c *gin.Context) {
			var newItem QCItem
			if err := c.ShouldBindJSON(&newItem); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Generate ID based on department
			var prefix string
			var count int
			department := strings.ToLower(newItem.Department)

			switch department {
			case "production":
				prefix = "PRD"
				count = len(qcData.Production) + 1
				qcData.Production = append(qcData.Production, newItem)
			case "overhaul":
				prefix = "OVH"
				count = len(qcData.Overhaul) + 1
				qcData.Overhaul = append(qcData.Overhaul, newItem)
			case "engineering":
				prefix = "ENG"
				count = len(qcData.Engineering) + 1
				qcData.Engineering = append(qcData.Engineering, newItem)
			case "stock":
				prefix = "STK"
				count = len(qcData.Stock) + 1
				qcData.Stock = append(qcData.Stock, newItem)
			default:
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid department"})
				return
			}

			newItem.ID = fmt.Sprintf("%s-%03d", prefix, count)
			newItem.Date = time.Now().Format("2006-01-02")

			// Update the last item in the slice with the generated ID
			switch department {
			case "production":
				qcData.Production[len(qcData.Production)-1] = newItem
			case "overhaul":
				qcData.Overhaul[len(qcData.Overhaul)-1] = newItem
			case "engineering":
				qcData.Engineering[len(qcData.Engineering)-1] = newItem
			case "stock":
				qcData.Stock[len(qcData.Stock)-1] = newItem
			}

			c.JSON(http.StatusCreated, gin.H{
				"message": "QC item added successfully",
				"item":    newItem,
			})
		})

		// Update QC item status (for repair)
		api.PUT("/qc/:id", func(c *gin.Context) {
			itemID := c.Param("id")

			var updateData struct {
				Status string `json:"status"`
			}

			if err := c.ShouldBindJSON(&updateData); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Find and update the item in the actual qcData slices
			updated := false

			for idx := range qcData.Production {
				if qcData.Production[idx].ID == itemID {
					qcData.Production[idx].Status = updateData.Status
					updated = true
					break
				}
			}
			if !updated {
				for idx := range qcData.Overhaul {
					if qcData.Overhaul[idx].ID == itemID {
						qcData.Overhaul[idx].Status = updateData.Status
						updated = true
						break
					}
				}
			}
			if !updated {
				for idx := range qcData.Engineering {
					if qcData.Engineering[idx].ID == itemID {
						qcData.Engineering[idx].Status = updateData.Status
						updated = true
						break
					}
				}
			}
			if !updated {
				for idx := range qcData.Stock {
					if qcData.Stock[idx].ID == itemID {
						qcData.Stock[idx].Status = updateData.Status
						updated = true
						break
					}
				}
			}

			if !updated {
				c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Item updated successfully"})
		})

		// Get statistics
		api.GET("/stats", func(c *gin.Context) {
			department := c.DefaultQuery("department", "all")
			data := GetDataByDepartment(department)
			stats := CalculateStatistics(data)

			c.JSON(http.StatusOK, stats)
		})
	}

	fmt.Println("Server starting on :8080")
	r.Run(":8080")
}
