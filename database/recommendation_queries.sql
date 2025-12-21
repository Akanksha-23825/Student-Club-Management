/* =========================================================
   STUDENT CLUB MANAGEMENT & RECOMMENDATION SYSTEM
   Recommendation Queries
   ========================================================= */

/* ---------------------------------------------------------
   1. Recommend clubs based on student interests
   ---------------------------------------------------------
   :usn is a placeholder for the student USN.
   It will be dynamically provided from frontend/backend.
---------------------------------------------------------- */
SELECT DISTINCT 
    c.club_name,
    c.category,
    c.description
FROM clubs c
JOIN club_interests ci 
    ON c.club_id = ci.club_id
JOIN student_interests si 
    ON ci.interest_id = si.interest_id
WHERE si.usn = :usn;


/* ---------------------------------------------------------
   2. List clubs that the student has NOT joined yet
---------------------------------------------------------- */
SELECT club_name
FROM clubs
WHERE club_id NOT IN (
    SELECT club_id
    FROM membership
    WHERE usn = :usn
);


/* ---------------------------------------------------------
   3. Count number of members in each club
---------------------------------------------------------- */
SELECT 
    c.club_name,
    COUNT(m.usn) AS member_count
FROM clubs c
LEFT JOIN membership m 
    ON c.club_id = m.club_id
GROUP BY c.club_name;


/* ---------------------------------------------------------
   4. Find students interested in a particular club
   (Example: club_id = 1)
---------------------------------------------------------- */
SELECT 
    s.name,
    s.usn
FROM student s
JOIN student_interests si 
    ON s.usn = si.usn
JOIN club_interests ci 
    ON si.interest_id = ci.interest_id
WHERE ci.club_id = 1;


/* ---------------------------------------------------------
   5. List all Cultural Clubs
   (Maps to RVCE Cultural Teams page)
---------------------------------------------------------- */
SELECT 
    club_name,
    description
FROM clubs
WHERE category = 'Cultural';


/* ---------------------------------------------------------
   6. List all Innovative / Technical Clubs
   (Maps to RVCE Innovative Teams page)
---------------------------------------------------------- */
SELECT 
    club_name,
    description
FROM clubs
WHERE category = 'Technical';
