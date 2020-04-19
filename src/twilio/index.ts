import twilio from 'twilio';

export const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioClient = twilio(accountSid, authToken);
  return twilioClient;
};

export const sendMessage = async (clientNumber: string, messageBody: string) => {
  const twilioClient = createTwilioClient();
  const twilioPhoneNum = process.env.TWILIO_PHONE_NUM;
  const twilioResult = await twilioClient.messages.create({
    to: clientNumber,
    from: twilioPhoneNum,
    body: messageBody,
  });
  return twilioResult;
};
