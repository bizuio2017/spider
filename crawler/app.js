var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var hello = require('./routes/hello');
var search = require('./routes/search');
var oemstrade = require('./routes/oemstrade');
var hqchip = require('./routes/hqchip');
var icgoo = require('./routes/icgoo');
var rightic = require('./routes/rightic');
var szlcsc = require('./routes/szlcsc');
var ichunt = require('./routes/ichunt');
var anglia = require('./routes/anglia');
var anglialist = require('./routes/anglialist');
var angliapages = require('./routes/angliapages');
var szlcsclist = require('./routes/szlcsclist');
var szlcsccat = require('./routes/szlcsccat');
var szlcscpages = require('./routes/szlcscpages');
var getip = require('./routes/getip');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/hello', hello);
app.use('/search', search);


app.use('/oemstrade', oemstrade);
app.use('/hqchip', hqchip);
app.use('/icgoo', icgoo);
app.use('/rightic', rightic);
app.use('/szlcsc', szlcsc);
app.use('/ichunt', ichunt);
app.use('/anglia', anglia);
app.use('/anglialist', anglialist);
app.use('/angliapages', angliapages);
app.use('/szlcsclist', szlcsclist);
app.use('/szlcsccat', szlcsccat);
app.use('/szlcscpages', szlcscpages);

app.use('/getip', getip);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
