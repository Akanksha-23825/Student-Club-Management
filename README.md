# Student Club Management and Recommendation System

## 📌 Project Overview
The **Student Club Management and Recommendation System** is a DBMS-based web application developed to manage student clubs in a college and recommend suitable clubs to students based on their interests and hobbies.

The system integrates a **MySQL database**, **Node.js & Express backend**, and an **interactive frontend** built using HTML, CSS, and JavaScript. It demonstrates real-world application of core DBMS concepts.

---

## 🎯 Objectives
- To manage and store details of student clubs
- To allow students to select interests and hobbies
- To recommend clubs based on selected interests
- To demonstrate many-to-many relationships in DBMS
- To provide a simple chatbot for answering club-related queries
- To build an interactive and user-friendly web interface

---

## 🧱 Technology Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL  
- **Version Control:** Git and GitHub  

---

## 🗄️ Database Design
The database is designed using proper normalization techniques and includes the following tables:

- `student`
- `clubs`
- `interest`
- `student_interests` (Many-to-Many relationship)
- `club_interests` (Many-to-Many relationship)
- `membership`

These tables enable efficient storage, querying, and recommendation of clubs.

---

## 🔁 Recommendation Logic
1. Students select their interests/hobbies using checkboxes on the UI
2. Selected interests are sent to the backend via REST API
3. Backend maps interests to clubs using the `club_interests` table
4. Matching clubs are fetched from the database
5. Recommended clubs are displayed dynamically on the frontend

This approach avoids hard-coded logic and efficiently uses database relationships.

---

## 🌐 Features
- View Cultural and Technical/Innovative clubs
- Interest-based club recommendation system
- Interactive and attractive frontend UI
- RESTful APIs for club data access
- Chatbot for basic club-related queries
- Clean separation of frontend, backend, and database layers

---

## ▶️ How to Run the Project

### 1️⃣ Database Setup
```sql
CREATE DATABASE student_club_db;
USE student_club_db;


👨‍🎓 Authors:
Akanksha N
Pranjal Vishal Usulkar
