
import nodemailer from "nodemailer"
import { EMAIL, PASSWORD } from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer";




export const sendEmail =async (mailOptions: Mail.Options)=>
{
    const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,  
    auth: {
    user: EMAIL,
    pass: PASSWORD,
},
tls: {
        rejectUnauthorized: false
    }
});



const info = await transporter.sendMail({
    from: `"Ashraff👻"<${EMAIL}>`,
    ...mailOptions
});

console.log("Message sent:", info.messageId);
    return info.accepted.length > 0 ?true:false
}

export const genrateOtp =async ()=>
{
    return Math.floor(Math.random()*900000 +100000)
}
