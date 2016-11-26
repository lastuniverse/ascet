var path = require('path');
var app = require('./app');
var debug = require('debug')('myapp_clean:server');
var fs = require('fs');

var conf = require('./conf/config.json');
app.set('port', conf.port);

var server=app;


if( conf.serverType === "http" ){
    // Create HTTP server.
    var http = require('http');
    server = http.createServer(app);
}else if( conf.serverType === "https" ){
    // Create HTTPS server.

    var file = path.join(__dirname, conf.options.key);
    console.log('file: ',file);
    conf.options.key = fs.readFileSync(file);

    file = path.join(__dirname, conf.options.cert);
    console.log('file: ',file);
    conf.options.cert = fs.readFileSync(conf.options.cert);

//    file = path.join(__dirname, conf.options.ca);
//    console.log('file: ',file);
//    conf.options.ca = fs.readFileSync(conf.options.ca);

    delete conf.options.ca;
    var https = require('https');
    server = https.createServer(conf.options, app);
}



if( conf.webSocket ){
//     var options = {   };
//     var expressWs = require('express-ws-routes');
//     server.wsServer = expressWs.createWebSocketServer(server, app, options);
    var expressWs = require('express-ws')(app,server);
    app.expressWs = expressWs;

}


// Listen on provided port, on all network interfaces.
server.listen(conf.port);
server.on('error', onError);
server.on('listening', onListening);



// Error listener for HTTP server "listening" event.
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error('Port ' + conf.port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error('Port ' + conf.port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

// Event listener for HTTP server "listening" event.
function onListening() {
    var addr = server.address();
    console.log('Server listening on port ' + conf.port);
}


