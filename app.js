var express = require('express');
var helmet = require('helmet');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var moment = require('moment');


var nedb = require('./modules/express-nedb');
var nedbStore = require('./modules/express-nedb-session')(session);

var uniq_id = require('./modules/express_uniq_id');


var routes = require('./routes/index');
var auth = require('./routes/auth');
var user = require('./routes/user');
var schedule = require('./routes/schedule');
var chat = require('./routes/chat');
var files = require('./routes/files');


// Create an express app with websocket support 
//var app = require('express-ws-routes')();
var app = express();
var expressWs = require('express-ws')(app);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.set('json spaces', 0);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(nedb({ app: app, path: path.join(__dirname,'data'), ext: 'json' }));
app.use(session({
	store: new nedbStore({nedb: app.nedb}),
	resave: true,
	saveUninitialized: true,
	name: 'ss',
	secret: 'nvf3489fnci3g',
	cookie: {
		secure: false,
		httpOnly: true
		// domain: 'example.com',
		// path: 'foo/bar',
		// expires: expiryDate
	}
}));








app.use('/', auth);
app.use('/', routes);
app.use('/chat', chat);
app.use('/user', user);
app.use('/schedule', schedule);
app.use('/files', files);


// подключаем websockets 
// делаем свой (локальный) вариант firebase
var likefb = require('./modules/express-like-firebase')({app: app, url: '/likefb'});

// подключаем роутеры для likeFirebase
likefb.route("test", require('./routes-ws/test') );
likefb.route("users", require('./routes-ws/users') );
likefb.route("user", require('./routes-ws/user') );
likefb.route("chat", require('./routes-ws/chat') );
likefb.route("tasks", require('./routes-ws/tasks') );
console.log("*******************************************");
console.log("likefb.url: "+likefb.url);


app.ws(likefb.url, function(ws, req) {
	console.log("ws connected to /likefb");
	if(!req.session.user)
		return ws.close();

	// запоминаем id пользователя
	ws.user_id = req.session.user.id;

	likefb.bind(ws, req);

});






// catch 404 and forward to error handler
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
