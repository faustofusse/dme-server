var { CORS_WHITELIST } = require('./utils/constants');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var imagesRouter = require('./routes/images');
var usersRouter = require('./routes/users');

var app = express();

// database config
require('./config/database');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS
// const checkOrigin = (origin, callback) => {
//   // if (CORS_WHITELIST.indexOf(origin) === -1) return callback(new Error('Not allowed by CORS'));
//   console.log('HOSTTTTT', origin);
//   callback(null, true);
// }
// const corsOptions = { origin: checkOrigin, optionsSuccessStatus: 200 };
const corsOptionsDelegate = async function (req, callback) {
  let corsOptions = { origin: true };
  let origin = req.header('Origin');
  // console.log('HOSTTTTT', origin);
  if (CORS_WHITELIST.indexOf(origin) === -1) corsOptions = { origin: false };
  callback(null, corsOptions);
}
app.use(cors(corsOptionsDelegate));
app.options('*', cors(corsOptionsDelegate));

// routes
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/images', imagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
