//const http_server = require("./libs/lib.http.server.js");
//const ipc_server = require("./libs/lib.ipc.server.js");
//const ipc_listeners = require("./libs/lib.ipc.listeners.js");


const electron = require('electron');
const eapp = electron.app; // Модуль контролирующей жизненый цикл нашего приложения.
const BrowserWindow = electron.BrowserWindow; // Модуль создающий браузерное окно.

// Опционально возможность отправки отчета о ошибках на сервер проекта Electron.
// electron.crashReporter.start();

// Определение глобальной ссылки , если мы не определим, окно
// окно будет закрыто автоматически когда JavaScript объект будет очищен сборщиком мусора.
var mainWindow = null;

// Проверяем что все окна закрыты и закрываем приложение.
eapp.on('window-all-closed', function() {
    // В OS X обычное поведение приложений и их menu bar
    // оставатся активными до тех пор пока пользователь закроет их явно комбинацией клавиш Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// Этот метод будет вызван когда Electron закончит инициализацию
// и будет готов к созданию браузерных окон.
eapp.on('ready', function() {
    // Создаем окно браузера.
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 760
    });






/**
 * Module dependencies.
 */

var app = require('./app');
var debug = require('debug')('myapp_clean:server');
var http = require('http');
var https = require('https');
var fs = require('fs');
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

//var server = http.createServer(app);


/**
 * Create HTTPS server.
 */
var options = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.crt'),
//  ca: fs.readFileSync('/home/quotes/ssl/gd_bundle-g2-g1.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

var server = https.createServer(options, app);



/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}



    // и загружаем файл index.html нашего веб приложения.
    mainWindow.loadURL('https://127.0.0.1:3000');
    //mainWindow.loadURL('http://127.0.0.1:8080/main.html');

    // Открываем DevTools.
    //mainWindow.webContents.openDevTools();

    // Этот метод будет выполнен когда генерируется событие закрытия окна.
    mainWindow.on('closed', function() {
        // Удаляем ссылку на окно, если ваше приложение будет подерживать несколько
        // окон вы будете хранить их в массиве, это время
        // когда нужно удалить соответсвующий элемент.
        mainWindow = null;
    });
});
