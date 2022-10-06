var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var logger = require('morgan');

var fileUpload=require('express-fileupload')


var db=require('./config/connection')


var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');

var app = express();
var session =require('express-session')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"Key"}))

db.connect((err)=>{
  if(err) console.log('connection error'+err);

  else console.log('Database connected');
})
app.use(fileUpload())

app.use('/', indexRouter);
app.use('/admin', adminRouter);



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
  res.render('404');
});


module.exports = app;
