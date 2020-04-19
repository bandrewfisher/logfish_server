import AWS from 'aws-sdk';

AWS.config.update({
  region: 'us-east-1',
});

const TableName = 'VerificationPhoneNumbers';

class VerificationPhoneNumbersDao {
  private docClient = new AWS.DynamoDB.DocumentClient();

  async addVerificationCode(phoneNumber: string, verificationCode: string) {
    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName,
      Item: {
        phoneNumber,
        verificationCode,
        verified: false,
      },
    };
    await this.docClient.put(params).promise();
  }
}

export default new VerificationPhoneNumbersDao();
