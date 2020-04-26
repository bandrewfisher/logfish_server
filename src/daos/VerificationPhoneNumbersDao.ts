import moment from 'moment';


const getExpirationString = (): string => {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 30);
  return moment(expiration).format('YYYY-MM-DD:HH:mm:ss');
};

export interface VerificationPhoneInfo {
  verificationCode: string;
  verified: boolean;
  expiration: string;
}
class VerificationPhoneNumbersDao {
  private numbersToVerify: { [key: string]: VerificationPhoneInfo } = {};

  addVerificationCode(phoneNumber: string, verificationCode: string) {
    const phoneRow: VerificationPhoneInfo = {
      verificationCode,
      verified: false,
      expiration: getExpirationString(),
    };

    this.numbersToVerify[phoneNumber] = phoneRow;
  }

  confirmCode(phoneNumber: string, verificationCode: string) {
    const phoneRow = this.numbersToVerify[phoneNumber];
    VerificationPhoneNumbersDao.verifyPhoneRow(phoneRow, verificationCode);
    this.numbersToVerify[phoneNumber] = {
      ...phoneRow,
      verified: true,
    };
  }

  private static validVerificationCode(dbCode: string, suppliedCode: string): boolean {
    return dbCode === suppliedCode;
  }

  private static validExpirationDate(expirationDate: string): boolean {
    const expiration = new Date(expirationDate);
    const now = new Date();
    return now < expiration;
  }

  private static verifyPhoneRow(phoneRow: VerificationPhoneInfo, verificationCode: string) {
    if (!VerificationPhoneNumbersDao.validVerificationCode(phoneRow.verificationCode,
      verificationCode)) {
      throw new Error('Invalid verification code.');
    }
    if (!VerificationPhoneNumbersDao.validExpirationDate(phoneRow.expiration)) {
      throw new Error('Your verification code has expired');
    }
  }
}

export default new VerificationPhoneNumbersDao();
