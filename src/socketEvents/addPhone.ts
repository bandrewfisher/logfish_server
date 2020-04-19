import cryptoRandomString from 'crypto-random-string';

import { sendMessage } from '../twilio';
import VerificationPhoneNumberDao from '../daos/VerificationPhoneNumbersDao';
import { isValidPhoneNumber } from '../utils';

const verifyNumber = (clientNumber: string) => {
  if (!clientNumber || !isValidPhoneNumber(clientNumber)) {
    throw new Error('Invalid phone number supplied');
  }
};

const createVerificationCode = (): string => cryptoRandomString({ length: 6, type: 'numeric' });

const listener = async (clientNumber: string) => {
  verifyNumber(clientNumber);
  const verificationCode = createVerificationCode();

  await VerificationPhoneNumberDao.addVerificationCode(clientNumber, verificationCode);
  await sendMessage(
    clientNumber,
    `Your Logfish verification code is ${verificationCode}`,
  );
};
export default listener;
