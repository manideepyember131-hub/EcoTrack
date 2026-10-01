import nodemailer from "nodemailer";
import "dotenv/config";

// ======================================================
// SMTP CONFIGURATION
// ======================================================

console.log("SMTP USER:", process.env.SMTP_USER);
console.log(
  "SMTP PASS EXISTS:",
  Boolean(process.env.SMTP_PASS)
);
console.log(
  "SMTP USER EXISTS:",
  Boolean(process.env.SMTP_USER)
);

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ======================================================
// VERIFY SMTP CONNECTION
// ======================================================

transporter.verify((error) => {
  if (error) {
    console.error(
      "SMTP verification failed:",
      error
    );
  } else {
    console.log(
      "SMTP server is ready to send emails"
    );
  }
});

// ======================================================
// SEND EMAIL
// ======================================================

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    // Make sure a recipient exists
    if (!to) {
      throw new Error(
        "Recipient email address is missing"
      );
    }

    console.log(
      "Sending EcoTrack email to:",
      to
    );

    const info = await transporter.sendMail({
      from: `"EcoTrack" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("========== EMAIL DELIVERY DEBUG ==========");
console.log("TO:", to);
console.log("ENVELOPE:", info.envelope);
console.log("ACCEPTED:", info.accepted);
console.log("REJECTED:", info.rejected);
console.log("RESPONSE:", info.response);
console.log("MESSAGE ID:", info.messageId);
console.log("==========================================");

    return info;

  } catch (error) {
    console.error(
      "Email sending failed:",
      error
    );

    throw error;
  }
};

export default transporter;