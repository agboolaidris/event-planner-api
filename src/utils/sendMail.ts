import AWS from "aws-sdk";
import dotenv from "dotenv";
import { SendEmailRequest } from "aws-sdk/clients/ses";
dotenv.config();

const SES_CONFIG = {
  accessKeyId: process.env.AWS_SES_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SES_SECRET_KEY,
  region: "me-south-1",
};

const AWS_SES = new AWS.SES(SES_CONFIG);

export const sendEmail = (
  recipientEmail: string,
  msg: string,
  subject: string
) => {
  let params: SendEmailRequest = {
    Source: "agboolaisholaidreez@gmail.com",
    Destination: {
      ToAddresses: [recipientEmail],
    },
    ReplyToAddresses: [],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: msg,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
  };
  return AWS_SES.sendEmail(params).promise();
};
