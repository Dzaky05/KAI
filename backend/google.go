package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	googleapi "google.golang.org/api/oauth2/v2"
)

var (
	oauthConf = &oauth2.Config{
		ClientID:     "YOUR_CLIENT_ID",
		ClientSecret: "YOUR_CLIENT_SECRET",
		RedirectURL:  "http://localhost:8080/auth/google/callback",
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	users      = map[string]User{}
	usersFile  = "users.json"
	sessionKey = "session_user_email"
)

type User struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Picture string `json:"picture"`
}

func main() {
	loadUsers()

	http.HandleFunc("/", handleMain)
	http.HandleFunc("/login", handleGoogleLogin)
	http.HandleFunc("/auth/google/callback", handleGoogleCallback)
	http.HandleFunc("/logout", handleLogout)

	fmt.Println("Server running at http://localhost:5173")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleMain(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(sessionKey)
	if err == nil {
		user, exists := users[cookie.Value]
		if exists {
			fmt.Fprintf(w, `
				<h2>Halo, %s</h2>
				<img src="%s" width="100"/><br>
				<a href="/logout">Logout</a>
			`, user.Name, user.Picture)
			return
		}
	}
	fmt.Fprint(w, `<a href="/login">Login dengan Google</a>`)
}

func handleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := oauthConf.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Code not found", http.StatusBadRequest)
		return
	}

	token, err := oauthConf.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Token exchange failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	client := oauthConf.Client(context.Background(), token)
	svc, err := googleapi.New(client)
	if err != nil {
		http.Error(w, "Failed to create Google service: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userinfo, err := svc.Userinfo.Get().Do()
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	user := User{
		ID:      userinfo.Id,
		Name:    userinfo.Name,
		Email:   userinfo.Email,
		Picture: userinfo.Picture,
	}

	// Simpan user jika belum ada
	if _, exists := users[user.Email]; !exists {
		users[user.Email] = user
		saveUsers()
	}

	// Simpan session (cookie)
	http.SetCookie(w, &http.Cookie{
		Name:  sessionKey,
		Value: user.Email,
		Path:  "/",
	})

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	cookie := &http.Cookie{
		Name:   sessionKey,
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	}
	http.SetCookie(w, cookie)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func loadUsers() {
	file, err := os.Open(usersFile)
	if err != nil {
		fmt.Println("No users found yet.")
		return
	}
	defer file.Close()

	json.NewDecoder(file).Decode(&users)
}

func saveUsers() {
	file, err := os.Create(usersFile)
	if err != nil {
		log.Println("Error saving users:", err)
		return
	}
	defer file.Close()

	json.NewEncoder(file).Encode(users)
}
