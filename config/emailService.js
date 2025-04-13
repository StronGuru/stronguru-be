const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const EMAIL_TEMPLATES = require('../constants/emailTemplates');

async function sendTemplateEmail({to, templateKey, dynamicData}) {
  const templateId = EMAIL_TEMPLATES[templateKey]
  const recipient = process.env.NODE_ENV === "development" ? process.env.TEST_EMAIL : to;

  if (!templateId) {
    throw new Error(`Template "${templateKey}" non definito nella configurazione.`);
  }

  await sgMail.send({
    to: recipient,
    from: {"email" : process.env.MAIL_FROM},
    templateId,
    dynamicTemplateData: dynamicData
  });
 
}

module.exports = sendTemplateEmail;