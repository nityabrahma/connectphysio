
'use server';

import nodemailer from 'nodemailer';

export async function sendFeedbackEmail(formData: FormData) {
  const message = formData.get('feedback') as string;
  const page = formData.get('page') as string;
  const userEmail = formData.get('userEmail') as string;

  const { SMTP_USER, SMTP_PASS, FEEDBACK_RECIPIENT_EMAIL } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !FEEDBACK_RECIPIENT_EMAIL) {
    console.error('Email sending credentials are not configured in environment variables.');
    // In production, you might not want to expose such detailed errors to the client.
    return { error: 'The server is not configured to send emails. Please contact support.' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS, // Use an "App Password" for Gmail, not your regular password
    },
  });

  const mailOptions = {
    from: `"ConnectPhysio Feedback" <${SMTP_USER}>`,
    to: FEEDBACK_RECIPIENT_EMAIL,
    subject: `New Feedback from ${userEmail}`,
    html: `
      <h2>New Feedback Received</h2>
      <p><strong>From:</strong> ${userEmail}</p>
      <p><strong>Page:</strong> ${page}</p>
      <hr>
      <h3>Message:</h3>
      <p style="white-space: pre-wrap;">${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send feedback email:', error);
    return { error: 'There was an issue sending your feedback. Please try again later.' };
  }
}
