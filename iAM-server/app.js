var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var reservationsRouter = require('./routes/reservations');
var lecturesRouter = require('./routes/lectures'); // 강의 관련 라우터
var facilitiesRouter = require('./routes/facilities'); // 시설 관련 라우터
var scheduleRouter = require('./routes/schedule'); // 스케줄 관련 라우터
var poolsRouter = require('./routes/pools');

var app = express();

// 뷰 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/reservations', reservationsRouter);
app.use('/lectures', lecturesRouter); // 강의 관련 엔드포인트
app.use('/facilities', facilitiesRouter); // 시설 관련 엔드포인트
app.use('/schedule', scheduleRouter); // 스케줄 관련 엔드포인트
app.use('/pools', poolsRouter);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { message: err.message, error: err });
});

module.exports = app;
