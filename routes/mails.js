// require express
const express   = require('express');
const router    = express.Router();
const auth            = require('../middleware/auth');
const nodemailer      = require("nodemailer");
const { google }      = require('googleapis');
const config          = require('config');

const template = "<div style='background-color:#f6efed; background-repeat:no-repeat; background-position:top left; background-attachment:fixed; margin: 0 auto;min-width: 320px;max-width: 600px;  padding: 0 30px;'><div style='background-color: #fff; min-height: 300px;'><div style='text-align: center; padding-top: 15px;'><img width='20%' src='https://ik.imagekit.io/qlamiikiy/psa_circle_QnbgN8wKT.png?ik-sdk-version=javascript-1.4.3&updatedAt=1656125092134'></div><h1 style='text-align:left; font-family:Arial,sans-serif; color:#f6efed; background-color:#8c1718; padding: 15px;font-size:120%;'>[TITLE]</h1> <div style='padding: 15px; text-align: left; font-size: 16px; font-weight: 400;'>[CONTENT] </div><div style='margin-top: 60px; padding: 15px; border-top: 1px solid #f6efed;'><p style='color: grey;text-align: center; margin: 0; padding: 5px;'><small>psalogistics.ng</small> | <small>support@psalogistics.ng</small></p><address style='color: grey;text-align: center; margin: 0; padding: 5px;'><small> 214, Zitel Plaza, Plot 227, POW Mafemi Crescent, Utako, Abuja</small></address><p style='color: grey;text-align: center; margin: 0; padding: 5px;'><small>09131111163</small> | <small>09131111164</small></p></div></div></div>";

// start sending a mail

// async..await is not allowed in global scope, must use a wrapper
const main = async (sender, receiver, subject, html, text) => {

    try {
      const OAuth2Client = new google.auth.OAuth2(
        config.get('gmailClientId'),
        config.get('gmailClientSecret'),
        config.get('gmailRedirectUrl'),
        );
    
      OAuth2Client.setCredentials({ refresh_token: config.get('gmailRefreshToken') });
      
        // create reusable transporter object using the default SMTP transport
        //type: "SMTP",
        //host: "smtp.gmail.com",
        //port: 465,//sudo ufw allow 587  sudo ufw delete allow from 587
        //secure: true, // true for 465, false for other ports
    
        const accessToken = await OAuth2Client.getAccessToken();
    
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: 'psaapp1@gmail.com',
            clientId: config.get('gmailClientId'),
            clientSecret: config.get('gmailClientSecret'),
            refreshToken: config.get('gmailRefreshToken'),
            accessToken: accessToken?.res?.data?.access_token,
            expires: 1658084390277
          },
        });
      
        // send mail with defined transport object
        // 315274394082-l58ceoj4ngi9lnk7emnrbsait2dr46jo.apps.googleusercontent.com
        //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
        let info = await transporter.sendMail({
          from: '"PSA" <'+sender+'>', // sender address
          to: receiver, // list of receivers
          subject: subject, // Subject line
          text: text, // plain text body
          html: html, // html body
        });
      
        return ("Message sent: %s", info.messageId);
    } catch (error) {
      console.log(error, error?.message, " sending message ");
    }


  }

// adding a new genre
router.post('/send', auth, async (req, res) => {
    try {
      const sender        = 'psaapp1@gmail.com';
      const receiver      = req.body.email;
      const message       = req.body.message;
      const subject       = req.body.subject;
      const finalMessage  = template.replace('[TITLE]', subject).replace('[CONTENT]', message);
      const sent          = await main(sender, receiver, subject, finalMessage, message).catch(error => console.log(error));
      console.log(sent, " sent message ");
      res.status(200).send(sent);
    } catch (error) {
      console.log(error, error?.message, " Message ");
      res.status(404).send({status: false, message: error?.message});
    }
    

  });

router.post('/reset', async (req, res) => {

    const sender        = 'psaapp1@gmail.com';
    const receiver      = req.body.email;
    const message       = req.body.message;
    const subject       = req.body.subject;
    const finalMessage  = template.replace('[TITLE]', subject).replace('[CONTENT]', message);
    const sent          = await main(sender, receiver, subject, finalMessage, message).catch(error => console.log(error));
    res.status(200).send(sent);
    });


module.exports = router;