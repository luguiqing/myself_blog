var express = require('express');
var path = require('path');
var session=require('express-session');//session已经分离出来了
var favicon = require('serve-favicon');
//var formidable = require('formidable'),
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');
var routes = require('./routes/index');//引入该文件，又为一个函数，所以routes（）为一个函数了


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));//set方法用于指定变量的值
app.set('view engine', 'ejs');
//上面代码使用set方法，为系统变量“views”和“view engine”指定值
app.use(flash());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser({ keepExtensions: true, uploadDir: './public/images' }));
//我们保留上传文件的后缀名，并把上传目录设置为 /public/images
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
// catch 404 and forward to error handler
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,
    store: new MongoStore({
          //db: settings.db
          url:'mongodb://localhost/'+settings.db,
          }, function() {
           console.log('connect mongodb success...');
       }) ,
    cookie: { maxAge : new Date(Date.now() + 1000 * 60 * 60)}
}));
//中间件
/*app.use(function(req, res, next){
  console.log(1);
  next();//有这个才能继续执行下面的
})*/

routes(app);


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
