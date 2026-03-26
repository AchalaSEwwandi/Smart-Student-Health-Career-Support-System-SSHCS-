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
 * Send a welcome email to a new CareMate user (e.g., Shop Owner)
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} options.name - user's name
 * @param {string} options.email - user's login email
 * @param {string} options.password - user's temporary password
 */
const sendWelcomeEmail = async ({ to, subject, name, email, password }) => {
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
                  <h2 style="color:#1E3A8A; margin:0 0 16px; font-size:22px;">Welcome to CareMate, ${name}! 🎉</h2>
                  <p style="color:#4B5563; font-size:15px; line-height:1.6; margin:0 0 24px;">
                    Your request to become a Shop Owner on the CareMate platform has been <strong>approved</strong>. We are thrilled to have you onboard!
                  </p>
                  
                  <p style="color:#4B5563; font-size:15px; line-height:1.6; margin:0 0 16px;">
                    Here are your account login credentials:
                  </p>
                  
                  <!-- Credentials Box -->
                  <div style="background:#F0FDF4; border:2px solid #10B981; border-radius:12px; padding:24px; text-align:left; margin:0 0 24px;">
                    <p style="color:#374151; font-size:15px; margin:0 0 8px;"><strong>Email:</strong> ${email}</p>
                    <p style="color:#374151; font-size:15px; margin:0;"><strong>Password:</strong> <span style="font-family:monospace; background:#D1FAE5; padding:4px 8px; border-radius:4px; color:#047857;">${password}</span></p>
                  </div>
                  
                  <p style="color:#EF4444; font-size:13px; line-height:1.5; margin:0 0 24px; font-weight:bold;">
                    Important: Please log in and change your password immediately for security purposes.
                  </p>

                  <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display:inline-block; background-color:#2563EB; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; font-size:15px;">Login to Your Dashboard</a>
                  </div>
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

module.exports = sendWelcomeEmail;
