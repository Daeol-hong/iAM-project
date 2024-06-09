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

// 모든 시설 가져오기 (poolID 포함)
router.get('/:poolID', (req, res) => {
    const { poolID } = req.params;
    const query = 'SELECT * FROM facilities WHERE poolID = ?';
    db.query(query, [poolID], (err, results) => {
        if (err) {
            console.error('Error fetching facilities:', err);
            return res.status(500).send('Error fetching facilities.');
        }
        res.json(results);
    });
});

// 시설 추가하기
router.post('/', (req, res) => {
    const { name, location, poolID } = req.body;
    const query = 'INSERT INTO facilities (name, location, poolID) VALUES (?, ?, ?)';
    db.query(query, [name, location, poolID], (err, results) => {
        if (err) {
            console.error('Error adding facility:', err);
            return res.status(500).send('Error adding facility.');
        }
        res.status(201).send('Facility added successfully.');
    });
});

// 시설 삭제하기
router.delete('/:facilityID', (req, res) => {
    const { facilityID } = req.params;
    const query = 'DELETE FROM facilities WHERE facilityID = ?';
    db.query(query, [facilityID], (err, results) => {
        if (err) {
            console.error('Error deleting facility:', err);
            return res.status(500).send('Error deleting facility.');
        }
        res.send('Facility deleted successfully.');
    });
});

module.exports = router;
