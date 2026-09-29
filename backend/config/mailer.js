const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    // 💡 यहाँ केवल "://gmail.com" रहेगा (बिना किसी // या @ के)
    host: "://gmail.com",
    port: 465,              // लाइव सर्वर के लिए 465 बिल्कुल सही है
    secure: true,           // पोर्ट 465 के लिए इसे true रखना ज़रूरी है

    // 💡 यह लाइन IPv6 के नेटवर्क एरर (ENETUNREACH) को हमेशा के लिए ठीक कर देगी
    family: 4,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },

    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000
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
