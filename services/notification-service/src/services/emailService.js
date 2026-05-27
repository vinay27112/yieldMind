import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTransactionEmail = async (toEmail, txData) => {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: toEmail,
      subject: `YieldMind — ${txData.type} confirmed`,
      html: `
        <h2>Transaction Confirmed</h2>
        <p>Your ${txData.type} of ${txData.amount} mUSDC has been confirmed.</p>
        <p><strong>Transaction Hash:</strong> ${txData.txHash}</p>
        <p><strong>View on Etherscan:</strong> 
          <a href="https://sepolia.etherscan.io/tx/${txData.txHash}">
            Click here
          </a>
        </p>
      `,
    });
    console.log(`Email sent for ${txData.type} to ${toEmail}`);
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

export const sendPriceAlertEmail = async (toEmail, alertData) => {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: toEmail,
      subject: `YieldMind — Price Alert: ${alertData.symbol}`,
      html: `
        <h2>Price Alert Triggered</h2>
        <p>${alertData.symbol} has reached $${alertData.price}</p>
        <p>Your alert threshold was $${alertData.threshold}</p>
      `,
    });
    console.log(`Price alert email sent to ${toEmail}`);
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};
