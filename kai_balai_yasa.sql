-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 17, 2025 at 04:27 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
-- Table structure for table `calibration`
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
-- Table structure for table `education`
--

CREATE TABLE `education` (
  `education_id` int(11) NOT NULL,
  `degree` varchar(100) DEFAULT NULL,
  `university` varchar(50) DEFAULT NULL,
  `year` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `experience`
--

CREATE TABLE `experience` (
  `experience_id` int(11) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `period` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `history_id` int(11) NOT NULL,
  `timestamp` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
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
-- Table structure for table `materials`
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
-- Table structure for table `overhaul`
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
-- Table structure for table `personalia`
--

CREATE TABLE `personalia` (
  `personalia_id` int(11) NOT NULL,
  `nip` varchar(50) DEFAULT NULL,
  `jabatan` varchar(50) DEFAULT NULL,
  `divisi` varchar(100) DEFAULT NULL,
  `lokasi` varchar(100) DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `urgent_number` varchar(50) DEFAULT NULL,
  `profile_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `personalia`
--

INSERT INTO `personalia` (`personalia_id`, `nip`, `jabatan`, `divisi`, `lokasi`, `status`, `join_date`, `phone_number`, `urgent_number`, `profile_id`) VALUES
(1, '103012400165', 'Pegawai', 'Enginering', NULL, 'Aktif', '2025-06-20', '081234898981', '082345789029', NULL),
(2, '103012400141', 'Asisten Manager', 'Enginering', NULL, 'Aktif', '2025-06-20', '081246991181', '082237937470', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `produksi`
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
  `inventory_id` int(11) DEFAULT NULL,
  `personnel_data` text DEFAULT NULL,
  `materials_data` text DEFAULT NULL,
  `progress_data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `produksi`
--

INSERT INTO `produksi` (`produksi_id`, `name`, `target`, `completed`, `status`, `start_date`, `end_date`, `materials_id`, `progress_id`, `inventory_id`, `personnel_data`, `materials_data`, `progress_data`) VALUES
(1, 'OVERHAUL', 20, 0, 'Selesai', '2025-07-17', '2025-08-17', NULL, NULL, NULL, '[\"103012400141\"]', '[{\"id\":0,\"name\":\"REL\",\"qty\":20,\"harga\":100000000,\"satuan\":\"unit\"}]', '');

-- --------------------------------------------------------

--
-- Table structure for table `produksi_team`
--

CREATE TABLE `produksi_team` (
  `produksi_team_id` int(11) NOT NULL,
  `produksi_id` int(11) DEFAULT NULL,
  `personalia_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `profile_id` int(11) NOT NULL,
  `email` longtext DEFAULT NULL,
  `address` longtext DEFAULT NULL,
  `phone_number` longtext DEFAULT NULL,
  `education_id` int(11) DEFAULT NULL,
  `experience_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `progress_id` int(11) NOT NULL,
  `date` varchar(100) DEFAULT NULL,
  `completed` int(11) DEFAULT NULL,
  `notes` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quality_control`
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
-- Table structure for table `rekayasa`
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
-- Table structure for table `rekayasa_team`
--

CREATE TABLE `rekayasa_team` (
  `rekayasa_team_id` int(11) NOT NULL,
  `personalia_id` int(11) DEFAULT NULL,
  `rekayasa_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_production`
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
-- Indexes for table `calibration`
--
ALTER TABLE `calibration`
  ADD PRIMARY KEY (`calibration_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `education`
--
ALTER TABLE `education`
  ADD PRIMARY KEY (`education_id`);

--
-- Indexes for table `experience`
--
ALTER TABLE `experience`
  ADD PRIMARY KEY (`experience_id`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`history_id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`materials_id`);

--
-- Indexes for table `overhaul`
--
ALTER TABLE `overhaul`
  ADD PRIMARY KEY (`overhaul_id`),
  ADD KEY `personalia_id` (`personalia_id`),
  ADD KEY `materials_id` (`materials_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `history_id` (`history_id`);

--
-- Indexes for table `personalia`
--
ALTER TABLE `personalia`
  ADD PRIMARY KEY (`personalia_id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Indexes for table `produksi`
--
ALTER TABLE `produksi`
  ADD PRIMARY KEY (`produksi_id`),
  ADD KEY `materials_id` (`materials_id`),
  ADD KEY `progress_id` (`progress_id`),
  ADD KEY `fk_inventory_id` (`inventory_id`);

--
-- Indexes for table `produksi_team`
--
ALTER TABLE `produksi_team`
  ADD PRIMARY KEY (`produksi_team_id`),
  ADD KEY `produksi_id` (`produksi_id`),
  ADD KEY `personalia_id` (`personalia_id`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`profile_id`),
  ADD KEY `education_id` (`education_id`),
  ADD KEY `experience_id` (`experience_id`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`progress_id`);

--
-- Indexes for table `quality_control`
--
ALTER TABLE `quality_control`
  ADD PRIMARY KEY (`qc_id`),
  ADD KEY `produksi_id` (`produksi_id`),
  ADD KEY `overhaul_id` (`overhaul_id`),
  ADD KEY `rekayasa_id` (`rekayasa_id`),
  ADD KEY `inventory_id` (`inventory_id`);

--
-- Indexes for table `rekayasa`
--
ALTER TABLE `rekayasa`
  ADD PRIMARY KEY (`rekayasa_id`);

--
-- Indexes for table `rekayasa_team`
--
ALTER TABLE `rekayasa_team`
  ADD PRIMARY KEY (`rekayasa_team_id`),
  ADD KEY `personalia_id` (`personalia_id`),
  ADD KEY `rekayasa_id` (`rekayasa_id`);

--
-- Indexes for table `stock_production`
--
ALTER TABLE `stock_production`
  ADD PRIMARY KEY (`stock_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `produksi_id` (`produksi_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `calibration`
--
ALTER TABLE `calibration`
  MODIFY `calibration_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `education`
--
ALTER TABLE `education`
  MODIFY `education_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `experience`
--
ALTER TABLE `experience`
  MODIFY `experience_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `materials_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `overhaul`
--
ALTER TABLE `overhaul`
  MODIFY `overhaul_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personalia`
--
ALTER TABLE `personalia`
  MODIFY `personalia_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `produksi`
--
ALTER TABLE `produksi`
  MODIFY `produksi_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `produksi_team`
--
ALTER TABLE `produksi_team`
  MODIFY `produksi_team_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `profile_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `progress_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quality_control`
--
ALTER TABLE `quality_control`
  MODIFY `qc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rekayasa`
--
ALTER TABLE `rekayasa`
  MODIFY `rekayasa_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rekayasa_team`
--
ALTER TABLE `rekayasa_team`
  MODIFY `rekayasa_team_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_production`
--
ALTER TABLE `stock_production`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calibration`
--
ALTER TABLE `calibration`
  ADD CONSTRAINT `calibration_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`);

--
-- Constraints for table `overhaul`
--
ALTER TABLE `overhaul`
  ADD CONSTRAINT `history_id` FOREIGN KEY (`history_id`) REFERENCES `history` (`history_id`),
  ADD CONSTRAINT `inventory_id` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`),
  ADD CONSTRAINT `overhaul_ibfk_1` FOREIGN KEY (`personalia_id`) REFERENCES `personalia` (`personalia_id`),
  ADD CONSTRAINT `overhaul_ibfk_2` FOREIGN KEY (`materials_id`) REFERENCES `materials` (`materials_id`);

--
-- Constraints for table `personalia`
--
ALTER TABLE `personalia`
  ADD CONSTRAINT `profile_id` FOREIGN KEY (`profile_id`) REFERENCES `profile` (`profile_id`);

--
-- Constraints for table `produksi`
--
ALTER TABLE `produksi`
  ADD CONSTRAINT `fk_inventory_id` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`),
  ADD CONSTRAINT `materials_id` FOREIGN KEY (`materials_id`) REFERENCES `materials` (`materials_id`),
  ADD CONSTRAINT `progress_id` FOREIGN KEY (`progress_id`) REFERENCES `progress` (`progress_id`);

--
-- Constraints for table `produksi_team`
--
ALTER TABLE `produksi_team`
  ADD CONSTRAINT `produksi_team_ibfk_1` FOREIGN KEY (`produksi_id`) REFERENCES `produksi` (`produksi_id`),
  ADD CONSTRAINT `produksi_team_ibfk_2` FOREIGN KEY (`personalia_id`) REFERENCES `personalia` (`personalia_id`);

--
-- Constraints for table `profile`
--
ALTER TABLE `profile`
  ADD CONSTRAINT `experience_id` FOREIGN KEY (`experience_id`) REFERENCES `experience` (`experience_id`),
  ADD CONSTRAINT `fk_personalia_profile` FOREIGN KEY (`profile_id`) REFERENCES `personalia` (`personalia_id`);

--
-- Constraints for table `quality_control`
--
ALTER TABLE `quality_control`
  ADD CONSTRAINT `quality_control_ibfk_1` FOREIGN KEY (`produksi_id`) REFERENCES `produksi` (`produksi_id`),
  ADD CONSTRAINT `quality_control_ibfk_2` FOREIGN KEY (`overhaul_id`) REFERENCES `overhaul` (`overhaul_id`),
  ADD CONSTRAINT `quality_control_ibfk_3` FOREIGN KEY (`rekayasa_id`) REFERENCES `rekayasa` (`rekayasa_id`),
  ADD CONSTRAINT `quality_control_ibfk_4` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`);

--
-- Constraints for table `rekayasa_team`
--
ALTER TABLE `rekayasa_team`
  ADD CONSTRAINT `rekayasa_team_ibfk_1` FOREIGN KEY (`personalia_id`) REFERENCES `personalia` (`personalia_id`),
  ADD CONSTRAINT `rekayasa_team_ibfk_2` FOREIGN KEY (`rekayasa_id`) REFERENCES `rekayasa` (`rekayasa_id`);

--
-- Constraints for table `stock_production`
--
ALTER TABLE `stock_production`
  ADD CONSTRAINT `stock_production_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`),
  ADD CONSTRAINT `stock_production_ibfk_2` FOREIGN KEY (`produksi_id`) REFERENCES `produksi` (`produksi_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
