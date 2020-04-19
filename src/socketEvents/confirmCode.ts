import VerificationPhoneNumbersDao from '../daos/VerificationPhoneNumbersDao';

const listener = async (phoneNumber: string, verificationCode: string) => {
  await VerificationPhoneNumbersDao.confirmCode(phoneNumber, verificationCode);
};

export default listener;
