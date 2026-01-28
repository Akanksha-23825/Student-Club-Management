DROP DATABASE IF EXISTS student_club_db;
CREATE DATABASE student_club_db;
USE student_club_db;

-- CLUBS TABLE
CREATE TABLE clubs (
    club_id INT PRIMARY KEY,
    club_name VARCHAR(100) NOT NULL,
    category ENUM('Technical','Cultural') NOT NULL,
    description TEXT
);

-- ACHIEVEMENTS TABLE
CREATE TABLE achievements (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    date_awarded DATE,
    club_id INT,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);
