const nodemailer = require("nodemailer");

const html = (code) => `
<div style="padding:0!important;margin:0 auto!important;display:block!important;min-width:100%!important;width:100%!important;background:#ffffff">
<center>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0;padding:0;width:100%;height:100%" bgcolor="#ffffff" class="m_-6657865289110351013gwfw">
        <tbody><tr>
            <td style="margin:0;padding:0;width:100%;height:100%" align="center" valign="top">
                <table width="775" border="0" cellspacing="0" cellpadding="0" class="m_-6657865289110351013m-shell">
                    <tbody><tr>
                        <td class="m_-6657865289110351013td" style="width:775px;min-width:775px;font-size:0pt;line-height:0pt;padding:0;margin:0;font-weight:normal">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                
                                <tbody><tr>
                                    <td class="m_-6657865289110351013mpy-35 m_-6657865289110351013mpx-15" bgcolor="#6b6ff0" style="padding:80px">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">

                                            
                                            <tbody>
                                            
                                            <tr>
                                                <td>

\t\t\t<table width="100%" border="0" cellspacing="0" cellpadding="0">
\t\t\t\t<tbody><tr>
\t\t\t\t\t<td style="font-size:36px;line-height:42px;font-family:'Motiva Sans',Helvetica,Arial,sans-serif;text-align:left;padding-bottom:30px;color:#ffffff;font-weight:bold">Dear DND-TODO User,</td>
\t\t\t\t</tr>
\t\t\t</tbody></table>
\t\t\t\t\t\t<table width="100%" border="0" cellspacing="0" cellpadding="0">
\t\t\t\t<tbody><tr>
\t\t\t\t\t<td style="font-size:18px;line-height:25px;font-family:'Motiva Sans',Helvetica,Arial,sans-serif;text-align:left;color:#ffffff;padding-bottom:30px">Here is the DND-TODO Guard code you need to verify your email:</td>
\t\t\t\t</tr>
\t\t\t</tbody></table>
\t\t\t\t\t\t<table width="100%" border="0" cellspacing="0" cellpadding="0">
\t\t\t\t<tbody><tr>
\t\t\t\t\t<td class="m_-6657865289110351013mpb-50" style="padding-bottom:70px">
\t\t\t\t\t\t<table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
\t\t\t\t\t\t\t<tbody><tr>
\t\t\t\t\t\t\t\t<td style="padding-top:30px;padding-bottom:30px;padding-left:56px;padding-right:56px">
\t\t\t\t\t\t\t\t\t<table width="100%" border="0" cellspacing="0" cellpadding="0">
\t\t\t\t\t\t\t\t\t\t<tbody><tr>
\t\t\t\t\t\t\t\t\t\t\t<td style="font-size:48px;line-height:52px;font-family:'Motiva Sans',Helvetica,Arial,sans-serif;color:#3a9aed;font-weight:bold;text-align:center">
\t\t\t\t\t\t\t\t\t\t\t\t${code}\t\t\t\t\t\t\t\t\t\t\t</td>
\t\t\t\t\t\t\t\t\t\t</tr>
\t\t\t\t\t\t\t\t\t</tbody></table>
\t\t\t\t\t\t\t\t</td>
\t\t\t\t\t\t\t</tr>
\t\t\t\t\t\t</tbody></table>
\t\t\t\t\t</td>
\t\t\t\t</tr>
\t\t\t</tbody></table>
\t\t\t\t\t\t<table width="100%" border="0" cellspacing="0" cellpadding="0">
\t\t\t\t<tbody><tr>
\t\t\t\t\t<td style="font-size:18px;line-height:25px;font-family:'Motiva Sans',Helvetica,Arial,sans-serif;text-align:left;color:#ffffff;padding-bottom:30px">This email was generated because of a signup attempt from a web or mobile device <br><br>
<span style="color:#ffffff;font-weight:bold">If you are not attempting to sign up</span> then ignore this email</td>
\t\t\t\t</tr>
\t\t\t</tbody></table>
\t\t\t            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tbody><tr>
                    <td style="font-size:18px;line-height:25px;font-family:'Motiva Sans',Helvetica,Arial,sans-serif;text-align:left;color:#3a9aed;padding-bottom:40px"></td>
                </tr>
            </tbody></table>
            
                                                                                                
                                                
                                                </td>
                                            </tr>

                                        </tbody></table>
                                    </td>
                                </tr>
                            
                            </tbody></table>
                        </td>
                    </tr>
                </tbody></table>
            </td>
        </tr>
    </tbody></table>
</center>

</div></div>
`;

// async..await is not allowed in global scope, must use a wrapper
async function main(email, code) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreply.dndtodo@gmail.com", // generated ethereal user
      pass: "Saurabh6162@", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"DND-TODO App 📚" <norepy.dndtodo@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Verification Email for DND-TODO Registration", // Subject line
    text: "Hello user?", // plain text body
    html: html(code), // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

}

module.exports = main;
