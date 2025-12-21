-- Student Club Management System
-- Final Schema (Approved)

CREATE DATABASE IF NOT EXISTS student_club_db;
USE student_club_db;

-- STUDENT
CREATE TABLE student (
    usn VARCHAR(15) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL
);

-- FACULTY
CREATE TABLE faculty (
    faculty_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL
);

-- CLUBS
CREATE TABLE clubs (
    club_id INT PRIMARY KEY AUTO_INCREMENT,
    club_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    club_head VARCHAR(100),
    faculty_id INT,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
);

-- INTEREST
CREATE TABLE interest (
    interest_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);

-- EVENTS
CREATE TABLE events (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    event_name VARCHAR(100) NOT NULL,
    event_date DATE,
    venue VARCHAR(100),
    description TEXT,
    club_id INT,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

-- ACHIEVEMENTS
CREATE TABLE achievements (
    achievement_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    description TEXT,
    date_awarded DATE,
    club_id INT,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

-- MEMBERSHIP
CREATE TABLE membership (
    membership_id INT PRIMARY KEY AUTO_INCREMENT,
    usn VARCHAR(15),
    club_id INT,
    status VARCHAR(20),
    joined_date DATE,
    FOREIGN KEY (usn) REFERENCES student(usn),
    FOREIGN KEY (club_id) REFERENCES clubs(club_id)
);

-- STUDENT_INTERESTS (M:N)
CREATE TABLE student_interests (
    usn VARCHAR(15),
    interest_id INT,
    PRIMARY KEY (usn, interest_id),
    FOREIGN KEY (usn) REFERENCES student(usn),
    FOREIGN KEY (interest_id) REFERENCES interest(interest_id)
);

-- CLUB_INTERESTS (M:N)
CREATE TABLE club_interests (
    club_id INT,
    interest_id INT,
    PRIMARY KEY (club_id, interest_id),
    FOREIGN KEY (club_id) REFERENCES clubs(club_id),
    FOREIGN KEY (interest_id) REFERENCES interest(interest_id)
);
