const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function userActivationEmail(to, activationToken) {
  const recipient = process.env.NODE_ENV === "development" ? process.env.TEST_EMAIL : to;
  const activation_token = activationToken
  await sgMail.send({
    to: recipient,
    from: {"email" : process.env.MAIL_FROM},
    templateId: process.env.SENDGRID_USER_TEMPLATE_ID,
    dynamicTemplateData: {
      activationToken: activation_token
  }
  });

  console.log(`Email inviata a: ${recipient}, con Token: ${activation_token}`);
}

module.exports = userActivationEmail;