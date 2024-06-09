var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
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

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { userID, password, role, age, phone, userName, email, poolID } = req.body;

    // 사용자 ID 중복 확인
    const checkQuery = 'SELECT userID FROM users WHERE userID = ?';
    db.query(checkQuery, [userID], async (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error checking userID:', checkErr);
        return res.status(500).send('Error checking userID.');
      }

      if (checkResults.length > 0) {
        return res.status(400).send('UserID already exists.');
      }

      // 비밀번호 해시화 및 사용자 등록
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO users (userID, password, role, age, phone, userName, email, poolID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [userID, hashedPassword, role, age, phone, userName, email, poolID], (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          return res.status(500).send('Error registering user.');
        }
        res.status(201).send('User registered.');
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error.');
  }
});

// 로그인
router.post('/login', (req, res) => {
  const { userID, password } = req.body;
  const query = `
    SELECT u.userID, u.password, u.role, u.poolID, p.poolName
    FROM users u
           JOIN pools p ON u.poolID = p.poolID
    WHERE u.userID = ?
  `;
  db.query(query, [userID], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).send('Error fetching user.');
    }

    if (results.length === 0) {
      return res.status(404).send('User not found.');
    }

    const user = results[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid credentials.');
    }

    res.json({
      userID: user.userID,
      role: user.role,
      poolID: user.poolID,
      poolName: user.poolName
    });
  });
});

// 아이디 찾기
router.post('/find-username', (req, res) => {
  const { email } = req.body;

  const query = 'SELECT userID FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('User not found.');
    }

    res.json({ userID: results[0].userID });
  });
});

// 비밀번호 재설정
router.post('/reset-password', async (req, res) => {
  const { email, userID, newPassword } = req.body;

  // 이메일과 아이디가 일치하는지 확인
  const verifyQuery = 'SELECT * FROM users WHERE email = ? AND userID = ?';
  db.query(verifyQuery, [email, userID], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('User not found or invalid credentials.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    const updateQuery = 'UPDATE users SET password = ? WHERE email = ? AND userID = ?';
    db.query(updateQuery, [hashedPassword, email, userID], (err, results) => {
      if (err || results.affectedRows === 0) {
        return res.status(500).send('Error updating password.');
      }

      res.send('Password updated.');
    });
  });
});

router.get('/instructors/:poolID', (req, res) => {
  const { poolID } = req.params;
  const query = 'SELECT userID, userName FROM users WHERE role = "instructor" AND poolID = ?';
  db.query(query, [poolID], (err, results) => {
    if (err) {
      console.error('Error fetching instructors:', err);
      return res.status(500).send('Error fetching instructors.');
    }
    res.json(results);
  });
});

router.get('/members/:poolID', (req, res) => {
  const { poolID } = req.params;
  const query = 'SELECT userID, userName FROM users WHERE role = "member" AND poolID = ?';
  db.query(query, [poolID], (err, results) => {
    if (err) {
      console.error('Error fetching instructors:', err);
      return res.status(500).send('Error fetching instructors.');
    }
    res.json(results);
  });
});

module.exports = router;
