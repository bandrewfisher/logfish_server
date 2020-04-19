import AWS from 'aws-sdk';
import moment from 'moment';

AWS.config.update({
  region: 'us-east-1',
});

const TableName = 'VerificationPhoneNumbers';

const getExpirationString = (): string => {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 30);
  return moment(expiration).format('YYYY-MM-DD:HH:mm:ss');
};

export interface VerificationPhoneRow {
  phoneNumber: string;
  verificationCode: string;
  verified: boolean;
  expiration: string;
}
class VerificationPhoneNumbersDao {
  private docClient = new AWS.DynamoDB.DocumentClient();

  async addVerificationCode(phoneNumber: string, verificationCode: string) {
    const phoneRow: VerificationPhoneRow = {
      phoneNumber,
      verificationCode,
      verified: false,
      expiration: getExpirationString(),
    };

    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName,
      Item: phoneRow,
    };
    await this.docClient.put(params).promise();
  }

  async confirmCode(phoneNumber: string, verificationCode: string) {
    const phoneRow = await this.getPhoneRow(phoneNumber);
    VerificationPhoneNumbersDao.verifyPhoneRow(phoneRow, verificationCode);

    const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName,
      Key: {
        phoneNumber,
      },
      UpdateExpression: 'set verified=:v',
      ExpressionAttributeValues: {
        ':v': true,
      },
    };
    await this.docClient.update(updateParams).promise();
  }

  private async getPhoneRow(phoneNumber: string):
    Promise<VerificationPhoneRow> {
    const getPhoneParams: AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName,
      Key: {
        phoneNumber,
      },
    };
    const { Item } = await this.docClient.get(getPhoneParams).promise();
    if (!Item) {
      throw new Error('Invalid phone number supplied');
    }
    return (Item as VerificationPhoneRow);
  }

  private static validVerificationCode(dbCode: string, suppliedCode: string): boolean {
    return dbCode === suppliedCode;
  }

  private static validExpirationDate(expirationDate: string): boolean {
    const expiration = new Date(expirationDate);
    const now = new Date();
    return now < expiration;
  }

  private static verifyPhoneRow(phoneRow: VerificationPhoneRow, verificationCode: string) {
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
