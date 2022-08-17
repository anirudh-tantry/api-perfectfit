// const nodemailer = require("nodemailer");

// exports.sendMail = async (options) => {
//   const transport = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: process.env.SENDER_EMAIL,
//     to: options.to,
//     subject: options.subject,
//     text: options.message,
//     html: "<b>Hello world?</b>",
//   }
//   transport.sendMail(mailOptions).then(console.log).catch(console.log);
// };

const { MailtrapClient } = require("mailtrap");
const { resetPasswordHTML } = require("./template");

exports.sendMail = async (options) => {
  const client = new MailtrapClient({
    endpoint: process.env.MAIL_TRAP_ENDPOINT,
    token: process.env.MAIL_TRAP_TOKEN,
  });

  const sender = {
    email: process.env.SENDER_EMAIL,
    name: "Perfect Fit",
  };
  const recipients = [
    {
      email: options.to,
    },
  ];

  await client.send({
    Category: "Password reset email",
    from: sender,
    to: recipients,
    subject: options.subject,
    text: options.message,
    html: resetPasswordHTML(options.url),
  });
};
