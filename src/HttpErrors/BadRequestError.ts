import HttpError from './HttpError';

export default class extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}
