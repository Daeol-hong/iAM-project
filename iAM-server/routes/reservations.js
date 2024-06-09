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

// 특정 사용자의 예약 목록 가져오기
router.get('/:userID', (req, res) => {
    const userID = req.params.userID;
    const query = `
        SELECT r.*, l.lectureName, l.lectureDate, l.lectureTime, u.userName as instructorName, l.location, l.capacity, 
               (SELECT COUNT(*) FROM reservations WHERE lectureID = l.lectureID) AS reservedCount
        FROM reservations r
        JOIN lectures l ON r.lectureID = l.lectureID
        JOIN users u ON l.instructorID = u.userID
        WHERE r.userID = ?
    `;
    db.query(query, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching reservations:', err);
            return res.status(500).send('Error fetching reservations.');
        }
        console.log('Fetched reservations:', results); // 쿼리 결과 로그 출력
        res.json(results);
    });
});

// 모든 예약 목록 가져오기
router.get('/', (req, res) => {
    const query = `
        SELECT r.*, l.lectureName, l.lectureDate, l.lectureTime, u.userName as instructorName, l.location, l.capacity
        FROM reservations r
        JOIN lectures l ON r.lectureID = l.lectureID
        JOIN users u ON l.instructorID = u.userID
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching reservations:', err);
            return res.status(500).send('Error fetching reservations.');
        }
        res.json(results);
    });
});

// 예약 생성
router.post('/create', (req, res) => {
    const { userID, reservationDate, reservationTime, lectureID, poolID } = req.body;
    const query = 'INSERT INTO reservations (userID, reservationDate, reservationTime, lectureID, poolID) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [userID, reservationDate, reservationTime, lectureID, poolID], (err, result) => { // 수정된 부분
        if (err) {
            console.error('Error creating reservation:', err);
            return res.status(500).send('Error creating reservation.');
        }
        res.status(201).send('Reservation created.');
    });
});


// 예약 취소
router.delete('/cancel/:id', (req, res) => {
    const reservationID = req.params.id;
    const query = 'DELETE FROM reservations WHERE reservationID = ?';
    db.query(query, [reservationID], (err, result) => {
        if (err) {
            console.error('Error canceling reservation:', err);
            return res.status(500).send('Error canceling reservation.');
        }
        res.send('Reservation canceled.');
    });
});

module.exports = router;
