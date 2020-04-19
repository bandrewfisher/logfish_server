import express from 'express';
import BadRequestError from '../HttpErrors/BadRequestError';
import { sendMessage } from '../twilio';

import { isValidPhoneNumber } from '../utils';

const router = express.Router();

router.route('/addPhone').post(async (req, res) => {
  try {
    const clientNumber = req.body.phoneNum;
    if (!clientNumber || !isValidPhoneNumber(clientNumber)) {
      throw new BadRequestError('Invalid phone number supplied');
    }
    const twilioResult = await sendMessage(
      clientNumber,
      'This was sent from express!',
    );
    res.status(201).json(twilioResult);
  } catch (err) {
    res.status(500).json(err);
  }
});
export default router;
