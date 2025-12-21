-- Find students interested in a particular club

-- Recommend clubs based on student interests
SELECT DISTINCT c.club_name, c.category, c.description
FROM clubs c
JOIN club_interests ci ON c.club_id = ci.club_id
JOIN student_interests si ON ci.interest_id = si.interest_id
WHERE si.usn = '1RV24IS001';

SELECT club_name
FROM clubs
WHERE club_id NOT IN (
    SELECT club_id
    FROM membership
    WHERE usn = '1RV24IS001'
);

SELECT c.club_name, COUNT(m.usn) AS member_count
FROM clubs c
LEFT JOIN membership m ON c.club_id = m.club_id
GROUP BY c.club_name;

SELECT s.name, s.usn
FROM student s
JOIN student_interests si ON s.usn = si.usn
JOIN club_interests ci ON si.interest_id = ci.interest_id
WHERE ci.club_id = 1;
