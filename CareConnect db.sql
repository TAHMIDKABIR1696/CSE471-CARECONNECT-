-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 10, 2025 at 07:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `careconnect`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`) VALUES
(1, 'Mahmud Admin', 'Mahmud.Admin@gmail.com', 'Mahmud@#1234'),
(2, 'Tanvir Ahmed', 'tanvir@admin.careconnect.com', 'tanvir@123'),
(3, 'Mariam Hossain', 'mariam@admin.careconnect.com', 'mariamPass'),
(4, 'Rafiul Islam', 'rafiul@admin.careconnect.com', 'rafiul321'),
(5, 'Nazia Karim', 'nazia@admin.careconnect.com', 'naziaSecure');

-- --------------------------------------------------------

--
-- Table structure for table `babysitter`
--

CREATE TABLE `babysitter` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `days_you_are_free` int(11) DEFAULT NULL,
  `password` varchar(20) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `average_rating` decimal(3,2) DEFAULT 0.00,
  `total_ratings` int(11) DEFAULT 0,
  `badges` text DEFAULT NULL,
  `experience_years` int(11) DEFAULT 0,
  `certifications` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `babysitter`
--

INSERT INTO `babysitter` (`id`, `name`, `location`, `days_you_are_free`, `password`, `email`, `latitude`, `longitude`, `active`) VALUES
(1, 'Munim Hasan', 'Dhaka', 12, 'Pass123', 'munim.hasan@gmail.com', 23.80452690, 90.39803982, 1),
(2, 'Isha Rahman', 'Dhaka', NULL, 'Pass124', 'isha.rahman@gmail.com', 23.80530000, 90.41750000, 0),
(3, 'Mahmud Khan', 'Dhaka', NULL, 'Pass125', 'mahmud.khan@gmail.com', 23.81530000, 90.40750000, 0),
(4, 'Habiba Sultana', 'Dhaka', NULL, 'Pass126', 'habiba.sultana@gmail.com', 23.81230000, 90.41550000, 0),
(5, 'Fardin Ahmed', 'Dhaka', NULL, 'Pass127', 'fardin.ahmed@gmail.com', 23.80730000, 90.41050000, 0),
(6, 'Sabrina Akter', 'Dhaka', NULL, 'Pass128', 'sabrina.akter@gmail.com', 23.81330000, 90.41350000, 0),
(7, 'Rifat Islam', 'Dhaka', NULL, 'Pass129', 'rifat.islam@gmail.com', 23.80830000, 90.41650000, 0),
(8, 'Farah Noor', 'Dhaka', NULL, 'Pass130', 'farah.noor@gmail.com', 23.81630000, 90.40850000, 0),
(9, 'Tamim Chowdhury', 'Dhaka', NULL, 'Pass131', 'tamim.chowdhury@gmail.com', 23.81130000, 90.41150000, 0),
(10, 'Nusrat Jahan', 'Dhaka', 10, 'Pass132', 'nusrat.jahan@gmail.com', 23.80450727, 90.38555145, 0);

-- --------------------------------------------------------

--
-- Table structure for table `confirmation`
--

CREATE TABLE `confirmation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sitter_id` int(11) NOT NULL,
  `sitter_name` varchar(100) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `parent_name` varchar(100) NOT NULL,
  `parent_confirm` tinyint(1) DEFAULT 0,
  `sitter_confirm` tinyint(4) DEFAULT 0,
  `link` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `confirmation`
--

INSERT INTO `confirmation` (`id`, `sitter_id`, `sitter_name`, `parent_id`, `parent_name`, `parent_confirm`, `sitter_confirm`, `link`, `date`) VALUES
(1, 10, 'Nusrat Jahan', 8, 'Lamia Mahzabin', 0, 0, 'https://meet.google.com/huk-srsg-dze', NULL),
(2, 7, 'Rifat Islam', 8, 'Lamia Mahzabin', 1, 0, NULL, NULL),
(3, 10, 'Nusrat Jahan', 8, 'Lamia Mahzabin', 1, 0, NULL, '2025-05-13'),
(4, 10, 'Nusrat Jahan', 8, 'Lamia Mahzabin', 1, 0, NULL, '2025-05-14'),
(5, 10, 'Nusrat Jahan', 8, 'Lamia Mahzabin', 1, 0, NULL, '2025-05-15'),
(6, 10, 'Nusrat Jahan', 5, 'Tania Karim', 1, 0, 'http://localhost:3000/meeting/14994b29-27a0-4229-98de-948befd88911', '2025-05-20'),
(7, 1, 'Munim Hasan', 5, 'Tania Karim', 1, 0, 'http://localhost:3000/meeting/366625f3-3072-4dcc-b6d4-456b66b28a97', '2025-05-14'),
(8, 5, 'Fardin Ahmed', 5, 'Tania Karim', 1, 0, NULL, '2025-05-13');

-- --------------------------------------------------------

--
-- Table structure for table `parent`
--

CREATE TABLE `parent` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `stubborn_level` int(11) DEFAULT NULL,
  `days_you_need` int(11) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `about_you` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parent`
--

INSERT INTO `parent` (`id`, `name`, `email`, `password`, `stubborn_level`, `days_you_need`, `amount`, `about_you`) VALUES
(1, 'Farzana Rahman', 'farzana.rahman@careconnect.com', 'pass123', 2, 3, 5000, 'Single mother looking for part-time help.'),
(2, 'Shafiq Islam', 'shafiq.islam@careconnect.com', 'safe456', 3, 5, 7000, 'Working dad with twins.'),
(3, 'Nasima Khatun', 'nasima.khatun@careconnect.com', 'nasima789', 1, 2, 3000, 'Needs occasional babysitting on weekends.'),
(4, 'Jamal Uddin', 'jamal.uddin@careconnect.com', 'jamal456', 4, 6, 8000, 'Strict but caring parent of 3.'),
(5, 'Tania Karim', 'tania.karim@careconnect.com', 'tania999', 2, 4, 6000, 'Remote worker, needs help during meetings.'),
(6, 'Raihan Kabir', 'raihan.kabir@careconnect.com', 'raihan123', NULL, NULL, NULL, 'Busy professional seeking reliable care.'),
(7, 'Sadia Alam', 'sadia.alam@careconnect.com', 'sadia456', NULL, NULL, NULL, 'First-time parent needing guidance.'),
(8, 'Lamia Mahzabin', 'lamia.mahzabin@careconnect.com', 'lamia789', NULL, NULL, NULL, 'Doctor with irregular schedule.');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` int(11) NOT NULL,
  `parent_id` varchar(20) NOT NULL,
  `parent_name` varchar(100) NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`id`, `parent_id`, `parent_name`, `transaction_id`, `amount`, `payment_date`) VALUES
(8, '8', 'Lamia Mahzabin', 'TXN20250510001', 2700.00, '2025-05-10 12:38:54'),
(9, '5', 'Tania Karim', 'TXN20250510002', 4800.00, '2025-05-10 17:11:06');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `rated_by` int(11) NOT NULL,
  `rated_to` int(11) NOT NULL,
  `rated_by_role` varchar(20) NOT NULL,
  `rated_to_role` varchar(20) NOT NULL,
  `punctuality` int(11) DEFAULT NULL,
  `professionalism` int(11) DEFAULT NULL,
  `communication` int(11) DEFAULT NULL,
  `overall_rating` decimal(3,2) NOT NULL,
  `review_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contacts`
--

CREATE TABLE `emergency_contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `user_role` varchar(20) NOT NULL,
  `contact_name` varchar(100) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sos_alerts`
--

CREATE TABLE `sos_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sitter_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `sitter_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `activity_time` datetime NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_reports`
--

CREATE TABLE `daily_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `sitter_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `meals` text DEFAULT NULL,
  `naps` text DEFAULT NULL,
  `activities` text DEFAULT NULL,
  `mood_rating` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `sender_role` varchar(20) NOT NULL,
  `receiver_role` varchar(20) NOT NULL,
  `message_text` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `is_translated` tinyint(1) DEFAULT 0,
  `original_language` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `live_sessions`
--

CREATE TABLE `live_sessions` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `babysitter_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `status` enum('active','paused','completed','cancelled') DEFAULT 'active',
  `current_latitude` decimal(10,8) DEFAULT NULL,
  `current_longitude` decimal(11,8) DEFAULT NULL,
  `home_latitude` decimal(10,8) DEFAULT NULL,
  `home_longitude` decimal(11,8) DEFAULT NULL,
  `geofence_radius_meters` int(11) DEFAULT 500,
  `location_updates` text DEFAULT NULL,
  `total_distance_km` decimal(10,2) DEFAULT 0.00,
  `geofence_violations` int(11) DEFAULT 0,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`session_id`),
  KEY `idx_booking` (`booking_id`),
  KEY `idx_babysitter` (`babysitter_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_links`
--

CREATE TABLE `class_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sitter_id` int(11) DEFAULT NULL,
  `sitter_name` varchar(100) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `info` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `consultation_slots`
--

CREATE TABLE `consultation_slots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) DEFAULT NULL,
  `parent_name` varchar(100) DEFAULT NULL,
  `sitter_id` int(11) DEFAULT NULL,
  `sitter_name` varchar(100) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `status` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `find_instant` varchar(255) DEFAULT NULL,
  `book_appointment` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sitter_record`
--

CREATE TABLE `sitter_record` (
  `record_id` int(11) NOT NULL,
  `id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `link` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sitter_record`
--

INSERT INTO `sitter_record` (`record_id`, `id`, `name`, `link`) VALUES
(1, 6, 'ankan11', 'https://youtu.be/48f7GexVGMI?si=esYsgW3wbH97SGuM'),
(2, 6, 'ankan11', 'https://youtu.be/ejTMnwW_3_E?si=Kp6WhbD0k3BnH36a'),
(3, 6, 'ankan11', 'https://youtu.be/ygmW8Y5lulo?si=wq1Sp_wlspP0Qn9d');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `address` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `babysitter`
--
ALTER TABLE `babysitter`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `class_links`
--

--
-- Indexes for table `confirmation`
--
ALTER TABLE `confirmation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `consultation_slots`
--
ALTER TABLE `consultation_slots`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sos_alerts`
--
ALTER TABLE `sos_alerts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `parent`
--
ALTER TABLE `parent`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sitter_record`
--
ALTER TABLE `sitter_record`
  ADD PRIMARY KEY (`record_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `babysitter`
--
ALTER TABLE `babysitter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `class_links`
--
ALTER TABLE `class_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `confirmation`
--
ALTER TABLE `confirmation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `consultation_slots`
--
ALTER TABLE `consultation_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sos_alerts`
--
ALTER TABLE `sos_alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_reports`
--
ALTER TABLE `daily_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `parent`
--
ALTER TABLE `parent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `live_sessions`
--
ALTER TABLE `live_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `sitter_record`
--
ALTER TABLE `sitter_record`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
