import express, { Request, Response, NextFunction } from 'express'; // eslint-disable-line no-unused-vars
import { Socket } from 'socket.io'; // eslint-disable-line no-unused-vars
import { sendMessage } from '../twilio';

import BadRequestError from '../HttpErrors/BadRequestError';
import ApiKeyDictionary from '../ApiKeyDictionary';

const router = express.Router();

const verifyRequest = (req: Request, _res: Response, next: NextFunction) => {
  const key = (req.headers['logfish-key'] as string);

  if (!key) {
    throw new BadRequestError('"logfish-key" is a required header');
  }
  const { data } = req.body;
  if (!data) {
    throw new BadRequestError('"data" is a required attribute in the request body');
  }

  if (!(ApiKeyDictionary.contains(key))) {
    throw new BadRequestError('Invalid API key supplied');
  }
  next();
};

const getApiKey = (req: Request): string => (req.headers['logfish-key'] as string);
const getLogData = ({ body: { data } }: Request): any => data;
const getSocket = (apiKey: string): Socket => ApiKeyDictionary.getSocket(apiKey);
const getPhoneNumber = (apiKey: string): string | null => ApiKeyDictionary.getPhoneNumber(apiKey);

router.route('/log').post(verifyRequest, async (req: Request, res: Response) => {
  const apiKey = getApiKey(req);
  const data = getLogData(req);
  const sock = getSocket(apiKey);
  const phone = getPhoneNumber(apiKey);

  let message;
  if (typeof data === 'string') {
    message = data;
  } else {
    message = JSON.stringify(data);
  }

  try {
    sock.emit('DATA', message);
    if (phone) {
      await sendMessage(phone, message);
    }
    res.status(201).end();
  } catch (err) {
    res.status(500).json({ message: 'Socket error' });
  }
});

export default router;
