-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 16 Jul 2025 pada 18.29
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kai_balai_yasa`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `calibration`
--

CREATE TABLE `calibration` (
  `calibration_id` int(11) NOT NULL,
  `tool_name` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `progress_step` int(11) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `last_update` datetime DEFAULT NULL,
  `inventory_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `education`
--

CREATE TABLE `education` (
  `education_id` int(11) NOT NULL,
  `degree` varchar(100) DEFAULT NULL,
  `university` varchar(50) DEFAULT NULL,
  `year` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `experience`
--

CREATE TABLE `experience` (
  `experience_id` int(11) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `period` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `history`
--

CREATE TABLE `history` (
  `history_id` int(11) NOT NULL,
  `timestamp` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory`
--

CREATE TABLE `inventory` (
  `inventory_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `itemCode` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `materials`
--

CREATE TABLE `materials` (
  `materials_id` int(11) NOT NULL,
  `materials_name` varchar(100) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `satuan` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `overhaul`
--

CREATE TABLE `overhaul` (
  `overhaul_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `estimate` varchar(50) DEFAULT NULL,
  `progress` int(11) DEFAULT NULL,
  `personalia_id` int(11) DEFAULT NULL,
  `materials_id` int(11) DEFAULT NULL,
  `history_id` int(11) DEFAULT NULL,
  `inventory_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `personalia`
--

CREATE TABLE `personalia` (
  `personalia_id` int(11) NOT NULL,
  `nip` int(11) DEFAULT NULL,
  `jabatan` varchar(50) DEFAULT NULL,
  `divisi` varchar(100) DEFAULT NULL,
  `lokasi` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `urgent_number` varchar(50) DEFAULT NULL,
  `profile_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `produksi`
--

CREATE TABLE `produksi` (
  `produksi_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `target` int(11) DEFAULT NULL,
  `completed` int(11) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `start_date` varchar(50) DEFAULT NULL,
  `end_date` varchar(50) DEFAULT NULL,
  `materials_id` int(11) DEFAULT NULL,
  `progress_id` int(11) DEFAULT NULL,
  `inventory_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `produksi_team`
--

CREATE TABLE `produksi_team` (
  `produksi_team_id` int(11) NOT NULL,
  `produksi_id` int(11) DEFAULT NULL,
  `personalia_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `profile`
--

CREATE TABLE `profile` (
  `profile_id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `education_id` int(11) DEFAULT NULL,
  `experience_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `progress`
--

CREATE TABLE `progress` (
  `progress_id` int(11) NOT NULL,
  `date` varchar(100) DEFAULT NULL,
  `completed` int(11) DEFAULT NULL,
  `notes` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `quality_control`
--

CREATE TABLE `quality_control` (
  `qc_id` int(11) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `batch_code` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `tested_count` int(11) DEFAULT NULL,
  `passed_count` int(11) DEFAULT NULL,
  `qc_date` date DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `produksi_id` int(11) DEFAULT NULL,
  `overhaul_id` int(11) DEFAULT NULL,
  `rekayasa_id` int(11) DEFAULT NULL,
  `inventory_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `rekayasa`
--

CREATE TABLE `rekayasa` (
  `rekayasa_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `team` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `progress` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `rekayasa_team`
--

CREATE TABLE `rekayasa_team` (
  `rekayasa_team_id` int(11) NOT NULL,
  `personalia_id` int(11) DEFAULT NULL,
  `rekayasa_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `stock_production`
--

CREATE TABLE `stock_production` (
  `stock_id` int(11) NOT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `last_update` datetime DEFAULT NULL,
  `inventory_id` int(11) DEFAULT NULL,
  `produksi_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `calibration`
--
ALTER TABLE `calibration`
  ADD PRIMARY KEY (`calibration_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indeks untuk tabel `education`
--
ALTER TABLE `education`
  ADD PRIMARY KEY (`education_id`);

--
-- Indeks untuk tabel `experience`
--
ALTER TABLE `experience`
  ADD PRIMARY KEY (`experience_id`);

--
-- Indeks untuk tabel `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`history_id`);

--
-- Indeks untuk tabel `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`);

--
-- Indeks untuk tabel `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`materials_id`);

--
-- Indeks untuk tabel `overhaul`
--
ALTER TABLE `overhaul`
  ADD PRIMARY KEY (`overhaul_id`),
  ADD KEY `personalia_id` (`personalia_id`),
  ADD KEY `materials_id` (`materials_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `history_id` (`history_id`);

--
-- Indeks untuk tabel `personalia`
--
ALTER TABLE `personalia`
  ADD PRIMARY KEY (`personalia_id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Indeks untuk tabel `produksi`
--
ALTER TABLE `produksi`
  ADD PRIMARY KEY (`produksi_id`),
  ADD KEY `materials_id` (`materials_id`),
  ADD KEY `progress_id` (`progress_id`),
  ADD KEY `fk_inventory_id` (`inventory_id`);

--
-- Indeks untuk tabel `produksi_team`
--
ALTER TABLE `produksi_team`
  ADD PRIMARY KEY (`produksi_team_id`),
  ADD KEY `produksi_id` (`produksi_id`),
  ADD KEY `personalia_id` (`personalia_id`);

--
-- Indeks untuk tabel `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`profile_id`),
  ADD KEY `education_id` (`education_id`),
  ADD KEY `experience_id` (`experience_id`);

--
-- Indeks untuk tabel `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`progress_id`);

--
-- Indeks untuk tabel `quality_control`
--
ALTER TABLE `quality_control`
  ADD PRIMARY KEY (`qc_id`),
  ADD KEY `produksi_id` (`produksi_id`),
  ADD KEY `overhaul_id` (`overhaul_id`),
  ADD KEY `rekayasa_id` (`rekayasa_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indeks untuk tabel `rekayasa`
--
ALTER TABLE `rekayasa`
  ADD PRIMARY KEY (`rekayasa_id`);

--
-- Indeks untuk tabel `rekayasa_team`
--
ALTER TABLE `rekayasa_team`
  ADD PRIMARY KEY (`rekayasa_team_id`),
  ADD KEY `personalia_id` (`personalia_id`),
  ADD KEY `rekayasa_id` (`rekayasa_id`);

--
-- Indeks untuk tabel `stock_production`
--
ALTER TABLE `stock_production`
  ADD PRIMARY KEY (`stock_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `produksi_id` (`produksi_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `calibration`
--
ALTER TABLE `calibration`
  MODIFY `calibration_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `education`
--
ALTER TABLE `education`
  MODIFY `education_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `experience`
--
ALTER TABLE `experience`
  MODIFY `experience_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `history`
--
ALTER TABLE `history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `materials`
--
ALTER TABLE `materials`
  MODIFY `materials_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `overhaul`
--
ALTER TABLE `overhaul`
  MODIFY `overhaul_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `personalia`
--
ALTER TABLE `personalia`
  MODIFY `personalia_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `produksi`
--
ALTER TABLE `produksi`
  MODIFY `produksi_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `produksi_team`
--
ALTER TABLE `produksi_team`
  MODIFY `produksi_team_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `profile`
--
ALTER TABLE `profile`
  MODIFY `profile_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `progress`
--
ALTER TABLE `progress`
  MODIFY `progress_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `quality_control`
--
ALTER TABLE `quality_control`
  MODIFY `qc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `rekayasa`
--
ALTER TABLE `rekayasa`
  MODIFY `rekayasa_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `rekayasa_team`
--
ALTER TABLE `rekayasa_team`
  MODIFY `rekayasa_team_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `stock_production`
--
ALTER TABLE `stock_production`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `calibration`
--
ALTER TABLE `calibration`
  ADD CONSTRAINT `calibration_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`);

--
-- Ketidakleluasaan untuk tabel `overhaul`
--
ALTER TABLE `overhaul`
  ADD CONSTRAINT `history_id` FOREIGN KEY (`history_id`) REFERENCES `history` (`history_id`),
  ADD CONSTRAINT `inventory_id` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`),
  ADD CONSTRAINT `overhaul_ibfk_1` FOREIGN KEY (`personalia_id`) REFERENCES `personalia` (`personalia_id`),
  ADD CONSTRAINT `overhaul_ibfk_2` FOREIGN KEY (`materials_id`) REFERENCES `materials` (`materials_id`);

--
-- Ketidakleluasaan untuk tabel `personalia`
--
ALTER TABLE `personalia`
  ADD CONSTRAINT `profile_id` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`profile_id`);

--
-- Ketidakleluasaan untuk tabel `produksi`
--
ALTER TABLE `produksi`
  ADD CONSTRAINT `fk_inventory_id` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`),
  ADD CONSTRAINT `materials_id` FOREIGN KEY (`materials_id`) REFERENCES `materials` (`materials_id`),
  ADD CONSTRAINT `progress_id` FOREIGN KEY (`progress_id`) REFERENCES `progress` (`progress_id`);

--
-- Ketidakleluasaan untuk tabel `produksi_team`
--
ALTER TABLE `produksi_team`
  ADD CONSTRAINT `produksi_team_ibfk_1` FOREIGN KEY (`produksi_id`) REFERENCES `produksi` (`produksi_id`),
  ADD CONSTRAINT `produksi_team_ibfk_2` FOREIGN KEY (`personalia_id`) REFERENCES `personalia` (`personalia_id`);

--
-- Ketidakleluasaan untuk tabel `profile`
--
ALTER TABLE `profile`
  ADD CONSTRAINT `education_id` FOREIGN KEY (`education_id`) REFERENCES `education` (`education_id`),
  ADD CONSTRAINT `experience_id` FOREIGN KEY (`experience_id`) REFERENCES `experience` (`experience_id`);

--
-- Ketidakleluasaan untuk tabel `quality_control`
--
ALTER TABLE `quality_control`
  ADD CONSTRAINT `quality_control_ibfk_1` FOREIGN KEY (`produksi_id`) REFERENCES `produksi` (`produksi_id`),
  ADD CONSTRAINT `quality_control_ibfk_2` FOREIGN KEY (`overhaul_id`) REFERENCES `overhaul` (`overhaul_id`),
  ADD CONSTRAINT `quality_control_ibfk_3` FOREIGN KEY (`rekayasa_id`) REFERENCES `rekayasa` (`rekayasa_id`),
  ADD CONSTRAINT `quality_control_ibfk_4` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`);

--
-- Ketidakleluasaan untuk tabel `rekayasa_team`
--
ALTER TABLE `rekayasa_team`
  ADD CONSTRAINT `rekayasa_team_ibfk_1` FOREIGN KEY (`personalia_id`) REFERENCES `personalia` (`personalia_id`),
  ADD CONSTRAINT `rekayasa_team_ibfk_2` FOREIGN KEY (`rekayasa_id`) REFERENCES `rekayasa` (`rekayasa_id`);

--
-- Ketidakleluasaan untuk tabel `stock_production`
--
ALTER TABLE `stock_production`
  ADD CONSTRAINT `stock_production_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`),
  ADD CONSTRAINT `stock_production_ibfk_2` FOREIGN KEY (`produksi_id`) REFERENCES `produksi` (`produksi_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
