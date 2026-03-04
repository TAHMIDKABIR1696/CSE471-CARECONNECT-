import nodemailer from "nodemailer";

/**
 * Email Notifications Service
 */

interface EmailUser {
  name?: string | null;
  email: string;
}

interface EmailBooking {
  startTime: Date;
  endTime: Date;
  totalAmount: number;
}

interface EmailPayment {
  transactionId: string;
  amount: number;
  currency: string;
  method?: string | null;
  paymentDate: Date;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; messageId?: string; message?: string; error?: string }> => {
  try {
    const transporter = createTransporter();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Email not configured. Skipping email send.");
      console.log("Would send to:", to);
      console.log("Subject:", subject);
      return { success: true, message: "Email skipped (not configured)" };
    }

    const info = await transporter.sendMail({
      from: `"CareConnect" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || html,
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const sendRegistrationEmail = async (user: EmailUser) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to CareConnect! 🎉</h2>
      <p>Hello ${user.name || user.email},</p>
      <p>Thank you for registering with CareConnect. Your account has been created successfully.</p>
      <p>Your account is currently pending approval. You will receive an email once your account is approved.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <br>
      <p>Best regards,<br>The CareConnect Team</p>
    </div>
  `;

  return await sendEmail(
    user.email,
    "Welcome to CareConnect - Registration Successful",
    html
  );
};

export const sendApprovalEmail = async (user: EmailUser) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Account Approved! ✅</h2>
      <p>Hello ${user.name || user.email},</p>
      <p>Great news! Your account has been approved by our admin team.</p>
      <p>You can now log in and start using all features of CareConnect.</p>
      <p><a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>
      <br>
      <p>Best regards,<br>The CareConnect Team</p>
    </div>
  `;

  return await sendEmail(
    user.email,
    "Your CareConnect Account Has Been Approved",
    html
  );
};

export const sendRejectionEmail = async (user: EmailUser, reason?: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Account Application Update</h2>
      <p>Hello ${user.name || user.email},</p>
      <p>We regret to inform you that your account application has not been approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>If you believe this is an error or would like to reapply, please contact our support team.</p>
      <br>
      <p>Best regards,<br>The CareConnect Team</p>
    </div>
  `;

  return await sendEmail(
    user.email,
    "CareConnect Account Application Update",
    html
  );
};

export const sendBookingRequestEmail = async (booking: EmailBooking, recipient: EmailUser) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Booking Request 📅</h2>
      <p>Hello ${recipient.name || recipient.email},</p>
      <p>You have received a new booking request.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Booking Details:</strong></p>
        <p>Date: ${new Date(booking.startTime).toLocaleString()}</p>
        <p>Duration: ${Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60) * 100) / 100} hours</p>
        <p>Amount: ${booking.totalAmount} BDT</p>
      </div>
      <p><a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/account/bookings" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Booking</a></p>
      <br>
      <p>Best regards,<br>The CareConnect Team</p>
    </div>
  `;

  return await sendEmail(
    recipient.email,
    "New Booking Request - CareConnect",
    html
  );
};

export const sendPaymentConfirmationEmail = async (payment: EmailPayment, recipient: EmailUser) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Confirmed! 💳</h2>
      <p>Hello ${recipient.name || recipient.email},</p>
      <p>Your payment has been confirmed successfully.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Payment Details:</strong></p>
        <p>Transaction ID: ${payment.transactionId}</p>
        <p>Amount: ${payment.amount} ${payment.currency}</p>
        <p>Method: ${payment.method}</p>
        <p>Date: ${new Date(payment.paymentDate).toLocaleString()}</p>
      </div>
      <br>
      <p>Best regards,<br>The CareConnect Team</p>
    </div>
  `;

  return await sendEmail(
    recipient.email,
    "Payment Confirmed - CareConnect",
    html
  );
};

export const sendMeetingLinkEmail = async (
  booking: EmailBooking,
  meetingLink: string,
  recipient: EmailUser
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Video Meeting Link 📹</h2>
      <p>Hello ${recipient.name || recipient.email},</p>
      <p>Your video meeting link for the booking is ready.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Booking Details:</strong></p>
        <p>Date: ${new Date(booking.startTime).toLocaleString()}</p>
        <p><strong>Meeting Link:</strong></p>
        <p><a href="${meetingLink}" style="color: #2196F3;">${meetingLink}</a></p>
      </div>
      <p><a href="${meetingLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Meeting</a></p>
      <br>
      <p>Best regards,<br>The CareConnect Team</p>
    </div>
  `;

  return await sendEmail(
    recipient.email,
    "Video Meeting Link - CareConnect",
    html
  );
};
