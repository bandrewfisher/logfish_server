import express, { ErrorRequestHandler } from 'express'; // eslint-disable-line no-unused-vars
import http from 'http';
import socket from 'socket.io';
import { v4 } from 'uuid';

// Socket events
import addPhone from './socketEvents/addPhone';
import confirmCode from './socketEvents/confirmCode';

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
    sock.on('ADD-PHONE', async (clientNumber: string) => {
      try {
        await addPhone(clientNumber);
        sock.emit('ADD-PHONE-SUCCESS');
      } catch (err) {
        sock.emit('ADD-PHONE-ERROR', err.message);
      }
    });

    sock.on('CONFIRM-PHONE', async (phoneNumber: string, verificationCode: string) => {
      try {
        await confirmCode(phoneNumber, verificationCode);
        ApiKeyDictionary.addPhoneNumber(phoneNumber, sock);
        sock.emit('CONFIRM-PHONE-SUCCESS');
      } catch (err) {
        sock.emit('CONFIRM-PHONE-ERROR', err.message);
      }
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
