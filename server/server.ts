import { Server } from './src/server';
var debug = require('debug')('express:server');
var http = require('http');
const path = require('path');
import * as express from 'express';

var httpPort = normalizePort(process.env.PORT || 3001);

const CLIENT_DIST_DIR = '../client/dist'; // We no longer depend on `__dirname` 
// because when compiled as 1000 UID user (not the root user) `__dirname` is equal to `/`
// and `path.join('/', '../anything_below');` equals `'/'` instead of '../anything_below'
const STATIC_DIR = '../client/static';
const HTML_FILE = path.join(CLIENT_DIST_DIR, 'index.html');
const isDevelopment = process.env.NODE_ENV !== 'production';

var app = Server.bootstrap().app;
app.set('port', httpPort);

if (!isDevelopment) {
  const history = require('connect-history-api-fallback');

  app.use(express.static(CLIENT_DIST_DIR));
  app.use('/public', express.static(STATIC_DIR));

  app.get('/client/*', (req, res) => res.sendFile(HTML_FILE));

  app.use(
    history({
      index: '/client/index.html',
    }),
  );
}

var httpServer = http.createServer(app);

httpServer.listen(httpPort);
httpServer.on('error', onError);
httpServer.on('listening', onListening);

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

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind =
    typeof httpPort === 'string' ? 'Pipe ' + httpPort : 'Port ' + httpPort;

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

function onListening() {
  var addr = httpServer.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
