USE student_club_db;

-- STUDENTS
INSERT INTO student VALUES
('1RV24IS001', 'Amit Kumar', 'amit@rvce.edu.in', 'ISE'),
('1RV24IS002', 'Sneha Rao', 'sneha@rvce.edu.in', 'ISE'),
('1RV24IS003', 'Rahul Jain', 'rahul@rvce.edu.in', 'CSE');

-- FACULTY
INSERT INTO faculty (name, department) VALUES
('Dr. Anil Kumar', 'ISE'),
('Dr. Meena Sharma', 'CSE');

-- CLUBS
INSERT INTO clubs (club_name, category, description, club_head, faculty_id) VALUES
('Coding Club', 'Technical', 'Programming and coding activities', 'Student Lead', 1),
('Music Club', 'Cultural', 'Music and performances', 'Student Lead', 2),
('Robotics Club', 'Technical', 'Robotics and automation', 'Student Lead', 1);

-- INTERESTS
INSERT INTO interest (name) VALUES
('Programming'),
('Music'),
('Robotics');

-- CLUB_INTERESTS
INSERT INTO club_interests VALUES
(1, 1),
(2, 2),
(3, 3);

-- STUDENT_INTERESTS
INSERT INTO student_interests VALUES
('1RV24IS001', 1),
('1RV24IS002', 2),
('1RV24IS003', 3);

-- MEMBERSHIP
INSERT INTO membership (usn, club_id, status, joined_date) VALUES
('1RV24IS001', 1, 'Approved', '2025-01-10'),
('1RV24IS002', 2, 'Approved', '2025-01-12');
