CREATE DATABASE  IF NOT EXISTS `datadrive` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `datadrive`;
-- MySQL dump 10.13  Distrib 8.0.40, for macos14 (arm64)
--
-- Host: localhost    Database: datadrive
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Cars`
--

DROP TABLE IF EXISTS `Cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cars` (
  `license_plate` varchar(7) NOT NULL,
  `make` varchar(45) NOT NULL,
  `model` varchar(45) NOT NULL,
  `status` enum('AVAILABLE','RENTED','MAINTENANCE') NOT NULL,
  `cost_per_km` decimal(10,2) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`license_plate`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cars`
--

LOCK TABLES `Cars` WRITE;
/*!40000 ALTER TABLE `Cars` DISABLE KEYS */;
INSERT INTO `Cars` VALUES ('ABC1234','Toyota','Corolla','AVAILABLE',0.50,'KAMARA'),('DEF4321','Ford','Fiesta','RENTED',0.55,'VOTSI'),('GHI8765','Volkswagen','Golf','MAINTENANCE',0.70,'THERMAIKOS'),('JKL9101','BMW','320i','MAINTENANCE',1.20,'SYNERGEIO'),('NIG3345','Audi','RS6','RENTED',7.30,'KALAMARIA'),('XYZ5678','Honda','Civic','AVAILABLE',0.60,'PANORAMA');
/*!40000 ALTER TABLE `Cars` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `Damages`
--

DROP TABLE IF EXISTS `Damages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Damages` (
  `id` bigint NOT NULL,
  `car_license_plate` varchar(7) NOT NULL,
  `reported_date` date NOT NULL,
  `description` mediumtext,
  `repaired` bit(1) NOT NULL,
  `repair_cost` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`,`car_license_plate`),
  KEY `car_license_plate` (`car_license_plate`),
  CONSTRAINT `Damages_ibfk_1` FOREIGN KEY (`car_license_plate`) REFERENCES `Cars` (`license_plate`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Damages`
--

LOCK TABLES `Damages` WRITE;
/*!40000 ALTER TABLE `Damages` DISABLE KEYS */;
INSERT INTO `Damages` VALUES (1,'ABC1234','2024-01-04','Scratched door',_binary '',149.43),(1,'DEF4321','2024-04-19','1 Broken mirror',_binary '',178.25),(1,'GHI8765','2024-12-21','2 Broken Doors',_binary '\0',560.43),(1,'JKL9101','2024-05-17','Engine issues',_binary '\0',1450.00),(1,'NIG3345','2024-07-25','Cracked axle',_binary '',740.58),(1,'XYZ5678','2024-05-16','Broken taillight',_binary '',205.89),(2,'ABC1234','2024-10-20','1 Broken mirror',_binary '',54.34),(2,'JKL9101','2024-10-22','Scratched left rear door',_binary '',120.45),(2,'XYZ5678','2024-11-25','Broken headlights',_binary '\0',350.00),(3,'ABC1234','2024-10-21','Burned down',_binary '',10000.00);
/*!40000 ALTER TABLE `Damages` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `Damages_BEFORE_INSERT` BEFORE INSERT ON `damages` FOR EACH ROW BEGIN
    DECLARE next_id BIGINT;

    -- Find the maximum ID for the given car_license_plate
    SELECT COALESCE(MAX(id), 0) + 1
    INTO next_id
    FROM `Damages`
    WHERE `car_license_plate` = NEW.`car_license_plate`;

    -- Assign the calculated ID to the new row
    SET NEW.`id` = next_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Payments`
--

DROP TABLE IF EXISTS `Payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payments` (
  `trip_id` bigint NOT NULL,
  `payment_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('SUBSCRIPTION','CARD','CRYPTO') NOT NULL,
  PRIMARY KEY (`trip_id`),
  CONSTRAINT `Payments_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `Trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payments`
--

LOCK TABLES `Payments` WRITE;
/*!40000 ALTER TABLE `Payments` DISABLE KEYS */;
INSERT INTO `Payments` VALUES (1,'2024-12-19 12:33:43',27.20,'CRYPTO'),(2,'2023-09-19 17:13:17',9.75,'CARD'),(3,'2024-03-06 16:29:31',39.10,'CARD'),(4,'2024-08-15 10:49:31',26.50,'SUBSCRIPTION'),(5,'2019-03-23 23:19:48',230.20,'CRYPTO'),(6,'2020-01-22 21:15:19',54.60,'CRYPTO');
/*!40000 ALTER TABLE `Payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reviews`
--

DROP TABLE IF EXISTS `Reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reviews` (
  `trip_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `comment` tinytext,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`trip_id`),
  CONSTRAINT `Reviews_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `Trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reviews`
--

LOCK TABLES `Reviews` WRITE;
/*!40000 ALTER TABLE `Reviews` DISABLE KEYS */;
INSERT INTO `Reviews` VALUES (1,4,'I liked the customizability','2024-12-19 12:34:21'),(2,5,'The ride was smooth and perfect','2023-09-19 17:15:41'),(3,2,'I didn’t like the car','2024-03-06 16:31:01'),(5,2,'The car was stinky','2019-03-23 23:20:19'),(6,3,'Had no problem moving around','2020-01-22 21:16:32');
/*!40000 ALTER TABLE `Reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Services`
--

DROP TABLE IF EXISTS `Services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Services` (
  `id` bigint NOT NULL,
  `car_license_plate` varchar(7) NOT NULL,
  `service_date` date NOT NULL,
  `description` mediumtext,
  `service_cost` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`,`car_license_plate`),
  KEY `car_license_plate` (`car_license_plate`),
  CONSTRAINT `Services_ibfk_1` FOREIGN KEY (`car_license_plate`) REFERENCES `Cars` (`license_plate`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Services`
--

LOCK TABLES `Services` WRITE;
/*!40000 ALTER TABLE `Services` DISABLE KEYS */;
INSERT INTO `Services` VALUES (1,'ABC1234','2024-03-18','Oil Change',67.00),(1,'DEF4321','2024-10-12','Tire Rotation and Balancing',54.00),(1,'GHI8765','2024-01-29','Engine Tune-Up',325.00),(1,'JKL9101','2024-05-05','Battery Replacement',197.00),(1,'NIG3345','2024-11-21','Air Conditioning Service',145.00),(1,'XYZ5678','2024-06-09','Brake Pad Replacement',178.00),(2,'ABC1234','2024-03-20','Battery Replacement',56.00),(2,'JKL9101','2024-06-01','Handbrake Replacement',150.00),(3,'ABC1234','2024-04-10','Clutch Replacement',110.00);
/*!40000 ALTER TABLE `Services` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `Services_BEFORE_INSERT` BEFORE INSERT ON `services` FOR EACH ROW BEGIN
    DECLARE next_id BIGINT;

    -- Find the maximum ID for the given car_license_plate
    SELECT COALESCE(MAX(id), 0) + 1
    INTO next_id
    FROM `Services`
    WHERE `car_license_plate` = NEW.`car_license_plate`;

    -- Assign the calculated ID to the new row
    SET NEW.`id` = next_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Subscriptions`
--

DROP TABLE IF EXISTS `Subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Subscriptions` (
  `name` enum('1_MONTH','3_MONTHS','1_YEAR') NOT NULL,
  `price_per_month` decimal(5,2) NOT NULL,
  `description` mediumtext,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Subscriptions`
--

LOCK TABLES `Subscriptions` WRITE;
/*!40000 ALTER TABLE `Subscriptions` DISABLE KEYS */;
INSERT INTO `Subscriptions` VALUES ('1_MONTH',60.00,'This is a subscription for 1 month'),('3_MONTHS',50.00,'This is a subscription for 3 months'),('1_YEAR',30.00,'This is a subscription for 1 year');
/*!40000 ALTER TABLE `Subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Trips`
--

DROP TABLE IF EXISTS `Trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Trips` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_email` varchar(45) NOT NULL,
  `car_license_plate` varchar(7) NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `driving_behavior` decimal(3,2) DEFAULT NULL,
  `distance` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_email` (`user_email`),
  KEY `car_license_plate` (`car_license_plate`),
  CONSTRAINT `Trips_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `Users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `Trips_ibfk_2` FOREIGN KEY (`car_license_plate`) REFERENCES `Cars` (`license_plate`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Trips`
--

LOCK TABLES `Trips` WRITE;
/*!40000 ALTER TABLE `Trips` DISABLE KEYS */;
INSERT INTO `Trips` VALUES (1,'moutas@gmail.com','NIG3345','2024-12-19 12:25:17','2024-12-19 12:33:43',9.9,5.30),(2,'billgates@icloud.com','XYZ5678','2023-09-19 17:31:31','2023-09-19 17:13:17',3.1,1.20),(3,'ntentas@gmail.com','ABC1234','2024-03-06 16:10:57','2024-03-06 16:29:31',4.5,6.20),(4,'ntentas@gmail.com','GHI8765','2024-08-15 10:31:32','2024-08-15 10:49:31',6.1,4.90),(5,'elonmusk@gmail.com','JKL9101','2019-03-23 21:29:07','2019-03-23 23:19:48',7.2,102.60),(6,'elonmusk@gmail.com','GHI8765','2020-01-22 13:55:39','2020-01-22 21:15:19',6.4,19.40),(7,'stevejobs@outlook.com','DEF4321','2024-12-26 11:18:24',NULL,NULL,NULL);
/*!40000 ALTER TABLE `Trips` ENABLE KEYS */;
UNLOCK TABLES;

CREATE INDEX idx_trips_user_email_end_time ON trips (user_email, end_time);

--
-- Temporary view structure for view `carservicedamagesummary`
--

DROP TABLE IF EXISTS `carservicedamagesummary`;
/*!50001 DROP VIEW IF EXISTS `carservicedamagesummary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `carservicedamagesummary` AS SELECT 
 1 AS `license_plate`,
 1 AS `make`,
 1 AS `model`,
 1 AS `service_date`,
 1 AS `service_cost`,
 1 AS `reported_date`,
 1 AS `repair_cost`,
 1 AS `repaired`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `usercartrip`
--

DROP TABLE IF EXISTS `usercartrip`;
/*!50001 DROP VIEW IF EXISTS `usercartrip`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `usercartrip` AS SELECT 
 1 AS `trip_id`,
 1 AS `username`,
 1 AS `make`,
 1 AS `model`,
 1 AS `distance`,
 1 AS `amount`,
 1 AS `payment_method`,
 1 AS `start_time`,
 1 AS `end_time`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `email` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `full_name` varchar(45) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `driving_behavior` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('billgates@icloud.com','bgates','Bill Gates','$2a$12$p/zB8YKlkyWbNn1SQcoWre1CUIbbktlKJh50o.Qc3aIieIuS9P2ce',4.50,'2020-11-28 17:13:53'),('chatzig@gmail.com','spychat','Spyros Chatzigeorgiou','$2a$12$p/zB8YKlkyWbNn1SQcoWre1CUIbbktlKJh50o.Qc3aIieIuS9P2ce',8.50,'2024-10-28 08:05:56'),('elonmusk@gmail.com','emusk','Elon Musk','$2a$12$p/zB8YKlkyWbNn1SQcoWre1CUIbbktlKJh50o.Qc3aIieIuS9P2ce',4.00,'2014-02-02 07:31:43'),('moutas@gmail.com','mjo','Ioannis Moutevelidis','$2a$12$p/zB8YKlkyWbNn1SQcoWre1CUIbbktlKJh50o.Qc3aIieIuS9P2ce',7.00,'2024-10-28 15:57:13'),('ntentas@gmail.com','tents','Dimitrios Ntentas','$2a$12$p/zB8YKlkyWbNn1SQcoWre1CUIbbktlKJh50o.Qc3aIieIuS9P2ce',9.00,'2024-10-28 11:25:19'),('stevejobs@outlook.com','sjobs','Steve Jobs','$2a$12$p/zB8YKlkyWbNn1SQcoWre1CUIbbktlKJh50o.Qc3aIieIuS9P2ce',2.00,'2007-06-14 12:27:19');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserSettings`
--

DROP TABLE IF EXISTS `UserSettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserSettings` (
  `user_email` varchar(45) NOT NULL,
  `seat_position_horizontal` decimal(4,1) DEFAULT NULL,
  `seat_position_vertical` decimal(4,1) DEFAULT NULL,
  `seat_recline_angle` decimal(4,1) DEFAULT NULL,
  `steering_wheel_position` decimal(4,1) DEFAULT NULL,
  `left_mirror_angle` decimal(4,1) DEFAULT NULL,
  `right_mirror_angle` decimal(4,1) DEFAULT NULL,
  `rearview_mirror_angle` decimal(4,1) DEFAULT NULL,
  `cabin_temperature` decimal(4,1) DEFAULT NULL,
  `drive_mode` enum('COMFORT','SPORT','ECO') DEFAULT NULL,
  `suspension_height` decimal(4,1) DEFAULT NULL,
  `engine_start_stop` bit(1) DEFAULT NULL,
  `cruise_control` bit(1) DEFAULT NULL,
  PRIMARY KEY (`user_email`),
  CONSTRAINT `UserSettings_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `Users` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserSettings`
--

LOCK TABLES `UserSettings` WRITE;
/*!40000 ALTER TABLE `UserSettings` DISABLE KEYS */;
INSERT INTO `UserSettings` VALUES ('billgates@icloud.com',12.4,8.3,100.9,28.6,43.3,47.5,39.7,23.8,'ECO',9.1,_binary '',_binary '\0'),('chatzig@gmail.com',15.3,11.7,120.2,30.8,44.5,50.2,40.1,22.4,'ECO',10.2,_binary '',_binary '\0'),('elonmusk@gmail.com',17.2,10.2,118.7,33.5,45.2,49.3,35.9,22.3,'SPORT',7.7,_binary '',_binary ''),('moutas@gmail.com',18.8,15.5,115.4,25.3,42.1,46.7,37.2,29.9,'COMFORT',12.6,_binary '',_binary ''),('ntentas@gmail.com',20.1,9.3,110.6,35.7,41.8,48.2,38.5,24.1,'SPORT',8.4,_binary '\0',_binary ''),('stevejobs@outlook.com',25.7,12.9,105.8,32.2,40.4,45.6,36.8,21.5,'ECO',11.3,_binary '\0',_binary '');
/*!40000 ALTER TABLE `UserSettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserSubscriptions`
--

DROP TABLE IF EXISTS `UserSubscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserSubscriptions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_email` varchar(45) NOT NULL,
  `subscription_name` enum('1_MONTH','3_MONTHS','1_YEAR') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_cancelled` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_email` (`user_email`),
  KEY `subscription_name` (`subscription_name`),
  CONSTRAINT `UserSubscriptions_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `Users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `UserSubscriptions_ibfk_2` FOREIGN KEY (`subscription_name`) REFERENCES `Subscriptions` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserSubscriptions`
--

LOCK TABLES `UserSubscriptions` WRITE;
/*!40000 ALTER TABLE `UserSubscriptions` DISABLE KEYS */;
INSERT INTO `UserSubscriptions` VALUES (1,'moutas@gmail.com','1_MONTH','2024-12-10','2025-01-10',_binary '\0'),(2,'billgates@icloud.com','3_MONTHS','2022-09-10','2022-12-10',_binary '\0'),(3,'ntentas@gmail.com','3_MONTHS','2024-09-15','2024-12-15',_binary ''),(4,'ntentas@gmail.com','1_YEAR','2024-11-16','2025-11-16',_binary '\0'),(5,'elonmusk@gmail.com','1_MONTH','2019-05-09','2019-06-09',_binary '\0'),(6,'elonmusk@gmail.com','1_YEAR','2020-06-29','2021-06-29',_binary '\0');
/*!40000 ALTER TABLE `UserSubscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `carservicedamagesummary`
--

/*!50001 DROP VIEW IF EXISTS `carservicedamagesummary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `carservicedamagesummary` AS select `c`.`license_plate` AS `license_plate`,`c`.`make` AS `make`,`c`.`model` AS `model`,`svc`.`service_date` AS `service_date`,`svc`.`service_cost` AS `service_cost`,`dmg`.`reported_date` AS `reported_date`,`dmg`.`repair_cost` AS `repair_cost`,`dmg`.`repaired` AS `repaired` from ((`cars` `c` left join `services` `svc` on((`c`.`license_plate` = `svc`.`car_license_plate`))) left join `damages` `dmg` on((`c`.`license_plate` = `dmg`.`car_license_plate`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `usercartrip`
--

/*!50001 DROP VIEW IF EXISTS `usercartrip`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `usercartrip` AS select `t`.`id` AS `trip_id`,`u`.`username` AS `username`,`c`.`make` AS `make`,`c`.`model` AS `model`,`t`.`distance` AS `distance`,`p`.`amount` AS `amount`,`p`.`payment_method` AS `payment_method`,`t`.`start_time` AS `start_time`,`t`.`end_time` AS `end_time` from (((`trips` `t` join `users` `u` on((`t`.`user_email` = `u`.`email`))) join `cars` `c` on((`t`.`car_license_plate` = `c`.`license_plate`))) left join `payments` `p` on((`t`.`id` = `p`.`trip_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-31 18:40:19
