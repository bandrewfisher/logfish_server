import express, { ErrorRequestHandler } from 'express'; // eslint-disable-line no-unused-vars
import http from 'http';
import socket from 'socket.io';
import { v4 } from 'uuid';

// Socket events
import addPhone from './socketEvents/addPhone';

// Routes
import routes from './routes';

// API keys to connection
import ApiKeyDictionary from './ApiKeyDictionary';

export const app = express();
const server = http.createServer(app);
export const io = socket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const init = () => {
  io.on('connection', (sock) => {
    const key = process.env.NODE_ENV === 'development' ? 'DEV_KEY' : v4();
    ApiKeyDictionary.addConnection(key, sock);
    sock.emit('CONNECT', key);
    sock.on('ADD-PHONE', (clientNumber) => {
      addPhone(sock, clientNumber);
    });
    sock.on('error', () => {
      console.log('there was an error');
    });
  });

  Object.values(routes).forEach((route) => {
    app.use(route);
  });

  const errHandler: ErrorRequestHandler = (err,
    _req, res, _next) => { // eslint-disable-line no-unused-vars
    const code = err.statusCode || 500;
    const message = err.message || 'Internal error';
    res.status(code).json({ message });
  };
  app.use(errHandler);
};

if (process.env.NODE_ENV !== 'test') {
  init();
  console.log('listening on port 5000');
  server.listen(5000);
}
