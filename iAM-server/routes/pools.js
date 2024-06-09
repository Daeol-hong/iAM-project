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

// 모든 수영장 정보 가져오기
router.get('/', (req, res) => {
    const query = 'SELECT * FROM pools';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching pools:', err);
            return res.status(500).send('Error fetching pools.');
        }
        res.json(results);
    });
});

// 수영장 정보 추가하기
router.post('/add', (req, res) => {
    const { name, address } = req.body;
    const query = 'INSERT INTO pools (name, address) VALUES (?, ?)';
    db.query(query, [name, address], (err, result) => {
        if (err) {
            console.error('Error adding pool:', err);
            return res.status(500).send('Error adding pool.');
        }
        res.status(201).send('Pool added successfully.');
    });
});

module.exports = router;
