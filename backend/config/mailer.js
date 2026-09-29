const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000
});

async function sendEmail({ to, subject, html, attachments = [] }) {
    return await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        attachments
    });
}

module.exports = {
    transporter,
    sendEmail
};
