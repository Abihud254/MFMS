import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter
  // For production, use a real email service like SendGrid, Mailgun, etc.
  // For this example, we'll use a dummy account.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Your App Name <noreply@yourapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html, // You can also send HTML emails
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
