"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTempaletLink = exports.emailTempalet = void 0;
const emailTempalet = (otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Verification Code</title>
</head>

<body style="margin:0; padding:0; background:#0f172a; font-family:'Segoe UI',Tahoma,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="margin:40px 0; background:#ffffff; border-radius:22px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.25);">

<!-- Header -->
<tr>
<td style="padding:0;">

<div style="
background:linear-gradient(135deg,#111827,#1e3a8a,#2563eb);
padding:45px 30px;
text-align:center;
color:white;
">

<div style="
width:80px;
height:80px;
line-height:80px;
margin:auto;
border-radius:50%;
background:rgba(255,255,255,0.15);
font-size:34px;
">
🔐
</div>

<h1 style="margin:20px 0 10px; font-size:30px;">
Security Verification
</h1>

<p style="margin:0; font-size:15px; opacity:0.9;">
Use the code below to continue securely
</p>

</div>

</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:45px 45px 20px; text-align:center;">

<p style="
margin:0;
font-size:16px;
color:#555;
line-height:1.8;
">
We received a request that requires identity verification.
Please use this one-time code:
</p>

<div style="
margin:30px auto;
padding:20px;
max-width:320px;
border-radius:18px;
background:linear-gradient(135deg,#eff6ff,#dbeafe);
border:1px solid #bfdbfe;
font-size:36px;
font-weight:800;
letter-spacing:10px;
color:#1d4ed8;
box-shadow:0 10px 25px rgba(37,99,235,0.15);
">
${otp}
</div>

<p style="
margin:0;
font-size:14px;
color:#888;
">
Valid for a limited time only
</p>

<p style="
margin-top:18px;
font-size:13px;
color:#999;
">
${new Date()}
</p>

</td>
</tr>

<!-- Button -->
<tr>
<td align="center" style="padding:10px 40px 35px;">

<a href="{{link}}" style="
display:inline-block;
padding:16px 38px;
border-radius:40px;
background:linear-gradient(135deg,#2563eb,#1d4ed8);
color:#fff;
font-size:16px;
font-weight:bold;
text-decoration:none;
box-shadow:0 12px 25px rgba(37,99,235,0.35);
">
Open Account
</a>

</td>
</tr>

<!-- Divider -->
<tr>
<td style="padding:0 45px;">
<hr style="border:none; border-top:1px solid #eee;">
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:30px 45px; text-align:center;">

<p style="margin:0; font-size:13px; color:#999;">
If you didn’t request this code, you can safely ignore this email.
</p>

<p style="margin:12px 0 0; font-size:12px; color:#bbb;">
© 2026 Secure App. All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
};
exports.emailTempalet = emailTempalet;
const emailTempaletLink = (link) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password</title>
</head>

<body style="margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI',Tahoma,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="
margin:40px 0;
background:#ffffff;
border-radius:22px;
overflow:hidden;
box-shadow:0 20px 45px rgba(0,0,0,0.08);
">

<!-- Header -->
<tr>
<td style="
background:linear-gradient(135deg,#059669,#10b981);
padding:45px 30px;
text-align:center;
color:white;
">

<div style="
width:75px;
height:75px;
line-height:75px;
margin:auto;
border-radius:50%;
background:rgba(255,255,255,0.18);
font-size:32px;
">
🔑
</div>

<h1 style="margin:20px 0 10px; font-size:30px;">
Reset Password
</h1>

<p style="margin:0; font-size:15px; opacity:0.9;">
Secure your account in one click
</p>

</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:45px; text-align:center;">

<p style="
margin:0;
font-size:16px;
line-height:1.8;
color:#555;
">
Click the button below to reset your password.
This link will expire in 10 minutes.
</p>

<a href="${link}" style="
display:inline-block;
margin-top:30px;
padding:16px 34px;
border-radius:40px;
background:linear-gradient(135deg,#10b981,#059669);
color:#fff;
font-size:16px;
font-weight:bold;
text-decoration:none;
box-shadow:0 12px 24px rgba(16,185,129,0.30);
">
Reset Now
</a>

<p style="
margin-top:30px;
font-size:13px;
color:#999;
line-height:1.7;
">
If you did not request a password reset,
please ignore this email.
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="
padding:25px;
text-align:center;
font-size:12px;
color:#bbb;
background:#f8fafc;
">
© 2026 Secure App
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};
exports.emailTempaletLink = emailTempaletLink;
