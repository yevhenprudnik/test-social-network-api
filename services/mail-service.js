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
      /**
   * @param to
   *   Email of a user with unconfirmed email.
   * @param link
   *   Confirmation link.
   */
  async sendActivationMail(to, link){
    await this.transporter.sendMail({
      from: "Social Network",
      to,
      subject: `Email confirmation`,
      text: '',
      html:
        `
          <div>
            <h1>To confirm your email follow the link below</h1>
            <a href="${link}">${link}</a>
          </div>
        `
    })
  }
}

module.exports = new MailService();