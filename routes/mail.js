const nodemailer = require('nodemailer');
const senderInfo = require('../config/senderinfo.json');

const mailSender = {
    sendGmail : function(param) {
        // 메일발송 함수
        var transporter = nodemailer.createTransport({
            service: 'gmail', 
            port: 587, 
            host: 'smtp.gmail.com', 
            secure: false,
            requireTLS: true,
            auth: {
                user: senderInfo.user, 
                pass: senderInfo.pass
            }
        });

        // 메일 옵션
        var mailOptions = {
            from: senderInfo.user, 
            to: param.toEmail,
            subject: param.subject,
            text: param.text
        };

        // 메일 발송
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}

module.exports = mailSender;