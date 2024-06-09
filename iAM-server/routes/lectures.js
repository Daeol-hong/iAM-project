var express = require('express');
var router = express.Router();
var mysql = require('mysql2');

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_pool'
});

// MySQL 연결 확인
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// 모든 강의 가져오기 (poolID 포함)
router.get('/:poolID', (req, res) => {
    const { poolID } = req.params;
    const query = `
        SELECT l.*, COUNT(r.lectureID) as reservedCount
        FROM lectures l
                 LEFT JOIN reservations r ON l.lectureID = r.lectureID
        WHERE l.poolID = ?
        GROUP BY l.lectureID
    `;
    db.query(query, [poolID], (err, results) => {
        if (err) {
            console.error('Error fetching lectures:', err);
            return res.status(500).send('Error fetching lectures.');
        }
        res.json(results);
    });
});

router.get('/available-lectures/:userId/:poolID', (req, res) => {
    const { userId, poolID } = req.params;
    const query = `
        SELECT l.*, COUNT(r.lectureID) as reservedCount
        FROM lectures l
                 LEFT JOIN reservations r ON l.lectureID = r.lectureID
        WHERE l.poolID = ? AND l.lectureID NOT IN (
            SELECT lectureID FROM reservations WHERE userID = ?
        )
        GROUP BY l.lectureID
    `;
    db.query(query, [poolID, userId], (err, results) => {
        if (err) {
            console.error('Error fetching available lectures:', err);
            return res.status(500).send('Error fetching available lectures.');
        }
        res.json(results);
    });
});

// 강의 추가 (poolID 포함)
router.post('/', (req, res) => {
    const { lectureName, instructorID, lectureDate, lectureTime, location, capacity, facilityID, poolID } = req.body;
    const query = 'INSERT INTO lectures (lectureName, instructorID, lectureDate, lectureTime, location, capacity, facilityID, poolID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [lectureName, instructorID, lectureDate, lectureTime, location, capacity, facilityID, poolID], (err, results) => {
        if (err) {
            console.error('Error adding lecture:', err);
            return res.status(500).send('Error adding lecture.');
        }
        res.status(201).send('Lecture added.');
    });
});

// 강의 삭제 (lectureID 및 poolID 포함)
router.delete('/:lectureID/:poolID', (req, res) => {
    const { lectureID, poolID } = req.params;
    const query = 'DELETE FROM lectures WHERE lectureID = ? AND poolID = ?';
    db.query(query, [lectureID, poolID], (err, results) => {
        if (err) {
            console.error('Error deleting lecture:', err);
            return res.status(500).send('Error deleting lecture.');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Lecture not found.');
        }
        res.status(200).send('Lecture deleted.');
    });
});

// 기타 엔드포인트도 비슷하게 수정

module.exports = router;
