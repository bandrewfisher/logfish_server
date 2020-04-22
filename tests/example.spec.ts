import request from 'supertest';

import { init, app } from '../src';

interface MockSocket {
  emit: jest.Mock;
  on: jest.Mock;
}
const mockSocket: MockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
};

jest.mock('socket.io', () => jest.fn().mockReturnValue({
  on: jest.fn((_event: string, cb: (sock: MockSocket) => void) => {
    cb(mockSocket);
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('fakeuuid'),
}));

beforeEach(() => {
  jest.clearAllMocks();
  init();
});
test('an api key is emitted on connection', () => {
  expect(mockSocket.emit).toHaveBeenCalledWith('CONNECT', 'fakeuuid');
});
test('POST to /log results in socket emitting posted data', async () => {
  const resp = await request(app)
    .post('/log')
    .set('logfish-key', 'fakeuuid')
    .send({ data: 'log me' });
  expect(resp.status).toBe(201);
  expect(mockSocket.emit).toHaveBeenLastCalledWith('DATA', 'log me');
});
test('POST without logfish-key header does not work', async () => {
  const resp = await request(app)
    .post('/log')
    .send({ data: 'log me' });
  expect(resp.status).toBe(400);
  expect(mockSocket.emit).toHaveBeenLastCalledWith('CONNECT', 'fakeuuid');
});
test('POST with malformed request body fails', async () => {
  const resp = await request(app)
    .post('/log')
    .set('logfish-key', 'fakeuuid')
    .send('Bad message');
  expect(resp.status).toBe(400);
  expect(mockSocket.emit).toHaveBeenLastCalledWith('CONNECT', 'fakeuuid');
});
test('socket failure', async () => {
  mockSocket.emit = jest.fn(() => {
    throw new Error('Bad socket');
  });
  const resp = await request(app)
    .post('/log')
    .set('logfish-key', 'fakeuuid')
    .send({ data: 'log me' });
  expect(resp.status).toBe(500);
});
