import express, { Request, Response, NextFunction } from 'express'; // eslint-disable-line no-unused-vars
import { Socket } from 'socket.io'; // eslint-disable-line no-unused-vars

import BadRequestError from '../HttpErrors/BadRequestError';
import InternalError from '../HttpErrors/InternalError';
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

router.route('/log').post(verifyRequest, (req: Request, res: Response) => {
  const apiKey = getApiKey(req);
  const data = getLogData(req);
  const sock = getSocket(apiKey);

  try {
    sock.emit('DATA', data);
    res.status(201).end();
  } catch (err) {
    throw new InternalError('Socket failture');
  }
});

export default router;
