const nodemailer = require('nodemailer');

/**
 * Create reusable nodemailer transporter using Gmail SMTP.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email using the CareMate branded HTML template.
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} options.otp - the 6-digit OTP code
 */
const sendEmail = async ({ to, subject, otp }) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#F9FAFB; font-family:'Inter',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9FAFB; padding:40px 0;">
        <tr>
          <td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.07);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%); padding:32px; text-align:center;">
                  <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:700;">🩺 CareMate</h1>
                  <p style="color:#93C5FD; margin:8px 0 0; font-size:14px;">Smart Student Health & Career Support</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 32px;">
                  <h2 style="color:#1E3A8A; margin:0 0 16px; font-size:22px;">Password Reset Request</h2>
                  <p style="color:#4B5563; font-size:15px; line-height:1.6; margin:0 0 24px;">
                    You have requested to reset your password. Use the following OTP code to verify your identity. This code is valid for <strong>10 minutes</strong>.
                  </p>
                  <!-- OTP Box -->
                  <div style="background:#F0FDF4; border:2px solid #10B981; border-radius:12px; padding:24px; text-align:center; margin:0 0 24px;">
                    <p style="color:#6B7280; font-size:13px; margin:0 0 8px; text-transform:uppercase; letter-spacing:1px;">Your OTP Code</p>
                    <h1 style="color:#1E3A8A; margin:0; font-size:40px; letter-spacing:8px; font-weight:800;">${otp}</h1>
                  </div>
                  <p style="color:#6B7280; font-size:13px; line-height:1.5; margin:0;">
                    If you did not request a password reset, please ignore this email or contact our support team.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#F9FAFB; padding:24px 32px; text-align:center; border-top:1px solid #E5E7EB;">
                  <p style="color:#9CA3AF; font-size:12px; margin:0;">
                    © ${new Date().getFullYear()} CareMate (SSHCS). All rights reserved.
                  </p>
                  <p style="color:#9CA3AF; font-size:12px; margin:8px 0 0;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"CareMate (SSHCS)" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
