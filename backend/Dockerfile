FROM golang:1.23

# Sesuaikan path kerja dengan nama module
WORKDIR /go/src/kai-backend

# Salin semua isi backend ke path module
COPY . .

# Jalankan perintah build
RUN go mod tidy
RUN go build -o main

EXPOSE 8080
CMD ["./main"]
