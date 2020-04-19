import cryptoRandomString from 'crypto-random-string';
import { Socket } from 'socket.io'; // eslint-disable-line no-unused-vars

import { sendMessage } from '../twilio';
import VerificationPhoneNumberDao from '../daos/VerificationPhoneNumbersDao';
import { isValidPhoneNumber } from '../utils';

const verifyNumber = (clientNumber: string) => {
  if (!clientNumber || !isValidPhoneNumber(clientNumber)) {
    throw new Error('Invalid phone number supplied');
  }
};

const createVerificationCode = (): string => cryptoRandomString({ length: 6, type: 'numeric' });

const listener = async (sock: Socket, clientNumber: string) => {
  try {
    verifyNumber(clientNumber);
    const verificationCode = createVerificationCode();

    await VerificationPhoneNumberDao.addVerificationCode(clientNumber, verificationCode);
    await sendMessage(
      clientNumber,
      `Your Logfish verification code is ${verificationCode}`,
    );
  } catch (err) {
    sock.emit('ADD-PHONE-ERROR', err.message);
  }
};
export default listener;
