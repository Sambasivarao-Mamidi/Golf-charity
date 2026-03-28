const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

const EMAIL_MODE = process.env.EMAIL_MODE || 'mock';
const EMAIL_FROM = process.env.EMAIL_FROM || 'GolfCharity <noreply@golfcharity.com>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const createTransporter = () => {
  if (EMAIL_MODE === 'mock') {
    return null;
  }

  if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: parseInt(process.env.MAILTRAP_PORT) || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">GolfCharity</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
          GolfCharity - Supporting charities through the love of golf
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          This email was sent to {{email}}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const templates = {
  winnerNotification: (data) => {
    const { userName, prizeAmount, matchCount, drawDate, winningNumbers } = data;
    return baseTemplate(`
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Congratulations, ${escapeHtml(userName)}!</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        You are a winner in the ${escapeHtml(drawDate)} GolfCharity draw!
      </p>
      <div style="background-color: #ecfdf5; border-radius: 12px; padding: 24px; margin: 0 0 24px; text-align: center;">
        <p style="margin: 0 0 8px; color: #059669; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">You Won</p>
        <p style="margin: 0 0 8px; color: #047857; font-size: 36px; font-weight: 700;">$${prizeAmount.toFixed(2)}</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">${matchCount} out of 5 numbers matched</p>
      </div>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
        <p style="margin: 0 0 12px; color: #4b5563; font-size: 14px;">Winning Numbers:</p>
        <p style="margin: 0; font-size: 20px; font-weight: 600; color: #10b981;">${(winningNumbers || []).map(n => escapeHtml(n.toString())).join(' - ')}</p>
      </div>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        To claim your prize, please submit proof of your score through your GolfCharity dashboard. Your proof will be reviewed by our team within 2-3 business days.
      </p>
      <a href="${CLIENT_URL}/my-winnings" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Submit Your Proof</a>
    `, 'Congratulations! You\'ve Won!');
  },

  prizeApproved: (data) => {
    const { userName, prizeAmount, drawDate } = data;
    return baseTemplate(`
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Great News, ${escapeHtml(userName)}!</h2>
      <div style="background-color: #ecfdf5; border-radius: 12px; padding: 24px; margin: 0 0 24px; text-align: center;">
        <p style="margin: 0 0 8px; color: #059669; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Prize Has Been Approved</p>
        <p style="margin: 0 0 8px; color: #047857; font-size: 36px; font-weight: 700;">$${prizeAmount.toFixed(2)}</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">from the ${escapeHtml(drawDate)} draw</p>
      </div>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Your proof of score has been verified and your prize is now approved for payment. Our team will process your payment within the next 5-7 business days.
      </p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
        Thank you for being part of GolfCharity!
      </p>
    `, 'Prize Approved - Payment Processing');
  },

  prizeRejected: (data) => {
    const { userName, prizeAmount, drawDate, reason } = data;
    return baseTemplate(`
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Additional Information Needed</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hello ${escapeHtml(userName)},
      </p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        We were unable to verify your prize claim for the ${escapeHtml(drawDate)} draw. Your submitted proof requires additional verification.
      </p>
      ${reason ? `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 0 0 24px;"><p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Reason:</strong> ${escapeHtml(reason)}</p></div>` : ''}
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Please submit a clearer image of your scorecard or additional documentation through your dashboard.
      </p>
      <a href="${CLIENT_URL}/my-winnings" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Submit New Proof</a>
    `, 'Additional Information Needed for Your Prize');
  },

  passwordReset: (data) => {
    const { userName, resetUrl, expiresIn } = data;
    return baseTemplate(`
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Reset Your Password</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hello ${escapeHtml(userName)},
      </p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      <div style="text-align: center; margin: 0 0 24px;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 12px;">
        This link will expire in ${expiresIn || '1 hour'}.
      </p>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        If you didn't request a password reset, you can safely ignore this email. Your account is secure.
      </p>
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin: 0;">
        <p style="margin: 0; color: #dc2626; font-size: 13px;">
          <strong>Security Notice:</strong> Never share this link with anyone. GolfCharity will never ask for your password via email.
        </p>
      </div>
    `, 'Reset Your Password');
  },

  subscriptionConfirmed: (data) => {
    const { userName, planType, amount, nextBillingDate } = data;
    return baseTemplate(`
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Welcome to GolfCharity Pro, ${escapeHtml(userName)}!</h2>
      <div style="background-color: #ecfdf5; border-radius: 12px; padding: 24px; margin: 0 0 24px; text-align: center;">
        <p style="margin: 0 0 8px; color: #059669; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Subscription is Active</p>
        <p style="margin: 0 0 4px; color: #047857; font-size: 24px; font-weight: 700;">${planType === 'yearly' ? 'Annual' : 'Monthly'} Plan</p>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">$${amount} per ${planType === 'yearly' ? 'year' : 'month'}</p>
      </div>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Your payment has been processed successfully. You now have access to all GolfCharity Pro features:
      </p>
      <ul style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0 0 24px; padding-left: 20px;">
        <li>Enter draws for exclusive prizes</li>
        <li>Track your scores and progress</li>
        <li>Support charitable causes</li>
        <li>Exclusive member benefits</li>
      </ul>
      ${nextBillingDate ? `<p style="color: #6b7280; font-size: 14px; margin: 0;">Next billing date: ${escapeHtml(nextBillingDate)}</p>` : ''}
    `, 'Welcome to GolfCharity Pro!');
  },

  welcome: (data) => {
    const { userName } = data;
    return baseTemplate(`
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">Welcome to GolfCharity, ${escapeHtml(userName)}!</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Thank you for joining GolfCharity! We're excited to have you as part of our community.
      </p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Here's how to get started:
      </p>
      <ol style="color: #4b5563; font-size: 15px; line-height: 2; margin: 0 0 24px; padding-left: 20px;">
        <li><strong>Subscribe to a plan</strong> - Unlock draw entries and prizes</li>
        <li><strong>Submit your scores</strong> - Enter your golf scores to get draw numbers</li>
        <li><strong>Support charity</strong> - Choose which charity to support</li>
        <li><strong>Win prizes</strong> - Get notified when you match winning numbers!</li>
      </ol>
      <div style="text-align: center; margin: 0 0 24px;">
        <a href="${CLIENT_URL}/subscription" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Get Started</a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
        If you have any questions, reply to this email and we'll be happy to help.
      </p>
    `, 'Welcome to GolfCharity!');
  }
};

const sendEmail = async ({ to, subject, template, data, userId }) => {
  const html = templates[template](data);
  const emailEntry = {
    to: data.userName || to,
    toEmail: to,
    subject,
    template,
    status: 'pending',
    metadata: { data },
    userId
  };

  if (EMAIL_MODE === 'mock') {
    console.log('\n========== EMAIL MOCK ==========');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Template:', template);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('HTML Length:', html.length, 'chars');
    console.log('================================\n');

    emailEntry.status = 'mock';
    emailEntry.sentAt = new Date();
    await EmailLog.create(emailEntry);
    return { success: true, mode: 'mock', emailLog: emailEntry };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html
    });

    emailEntry.status = 'sent';
    emailEntry.sentAt = new Date();
    emailEntry.metadata = { ...emailEntry.metadata, messageId: info.messageId };
    await EmailLog.create(emailEntry);

    return { success: true, mode: 'real', messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    
    emailEntry.status = 'failed';
    emailEntry.error = error.message;
    emailEntry.sentAt = new Date();
    await EmailLog.create(emailEntry);

    return { success: false, error: error.message };
  }
};

const sendWinnerNotification = async (user, draw, prizeAmount) => {
  const winner = draw.winners.find(w => w.user.toString() === user._id.toString());
  return sendEmail({
    to: user.email,
    subject: `Congratulations! You've Won $${prizeAmount.toFixed(2)}`,
    template: 'winnerNotification',
    data: {
      userName: user.name,
      prizeAmount,
      matchCount: winner?.matchCount || 0,
      drawDate: new Date(draw.drawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      winningNumbers: draw.winningNumbers
    },
    userId: user._id
  });
};

const sendPrizeApproved = async (user, draw, prizeAmount) => {
  return sendEmail({
    to: user.email,
    subject: 'Prize Approved - Payment Processing',
    template: 'prizeApproved',
    data: {
      userName: user.name,
      prizeAmount,
      drawDate: new Date(draw.drawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    },
    userId: user._id
  });
};

const sendPrizeRejected = async (user, draw, prizeAmount, reason) => {
  return sendEmail({
    to: user.email,
    subject: 'Additional Information Needed for Your Prize',
    template: 'prizeRejected',
    data: {
      userName: user.name,
      prizeAmount,
      drawDate: new Date(draw.drawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      reason
    },
    userId: user._id
  });
};

const sendPasswordReset = async (user, resetToken) => {
  const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password',
    template: 'passwordReset',
    data: {
      userName: user.name,
      resetUrl,
      expiresIn: '1 hour'
    },
    userId: user._id
  });
};

const sendSubscriptionConfirmed = async (user, planType, amount) => {
  const nextBillingDate = planType === 'yearly'
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return sendEmail({
    to: user.email,
    subject: 'Welcome to GolfCharity Pro!',
    template: 'subscriptionConfirmed',
    data: {
      userName: user.name,
      planType,
      amount,
      nextBillingDate
    },
    userId: user._id
  });
};

const sendWelcome = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to GolfCharity!',
    template: 'welcome',
    data: {
      userName: user.name
    },
    userId: user._id
  });
};

module.exports = {
  sendEmail,
  sendWinnerNotification,
  sendPrizeApproved,
  sendPrizeRejected,
  sendPasswordReset,
  sendSubscriptionConfirmed,
  sendWelcome,
  templates,
  escapeHtml
};
