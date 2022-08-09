const nodemailer = require('nodemailer');

class MailService {
  constructor(){
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    })
  }
  
  async sendActionMail(to, link){
    await this.transporter.sendMail({
      from: process.env.SMTP_PORT,
      to,
      subject: `Email confirmation on ${process.env.CLIENT_URL}`,
      text: '',
      html:
        `
          <div>
            <h1>To confirm your email click the button below</h1>
            <button href="${link}">CONFIRM</button>
          </div>
        `
    })
  }
}

module.exports = new MailService();