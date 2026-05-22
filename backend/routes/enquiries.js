import express from 'express';
import Joi from 'joi';
import nodemailer from 'nodemailer';
import Enquiry from '../models/Enquiry.js';

const router = express.Router();

const enquirySchemaJoi = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Your name is required',
  }),
  phone: Joi.string().trim().required().messages({
    'string.empty': 'Your contact phone number is required',
  }),
  email: Joi.string().email().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Your email is required',
  }),
  message: Joi.string().trim().required().messages({
    'string.empty': 'Your message details are required',
  }),
});

// Helper to send Thank You email
const sendThankYouEmail = async (enquiry) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'kan93095@gmail.com',
        pass: process.env.SMTP_PASS || '',
      },
    });

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #f97316; padding: 30px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">Ayyappa Travels</h1>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Message Enquiry Received</p>
        </div>
        <div style="padding: 30px; color: #334155; line-height: 1.7; background-color: #ffffff;">
          <h2 style="color: #f97316; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #fed7aa; padding-bottom: 8px;">Hi ${enquiry.name},</h2>
          <p style="margin-bottom: 20px; font-size: 15px;">Thank you for contacting <strong>Ayyappa Travels</strong>, Srivilliputtur's premier Private Outstation & Pilgrimage Car Rental service.</p>
          <p style="margin-bottom: 15px; font-size: 15px;">We have successfully received your enquiry. Our reservation desk will review your requirements and reach out to you within 30 minutes.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #1e293b; border-left: 4px solid #f97316; padding-left: 10px; font-weight: 700;">Submitted Enquiry Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 30%;">Name</td><td style="padding: 10px 0; color: #1e293b; font-weight: 500;">${enquiry.name}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #64748b;">Phone</td><td style="padding: 10px 0; color: #1e293b; font-weight: 500;">${enquiry.phone}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #64748b;">Email</td><td style="padding: 10px 0; color: #1e293b; font-weight: 500;">${enquiry.email}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: 600; color: #64748b; vertical-align: top;">Message</td><td style="padding: 10px 0; color: #1e293b; font-weight: 500; white-space: pre-line;">${enquiry.message}</td></tr>
            </table>
          </div>

          <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; font-size: 13.5px; color: #7c2d12; border-left: 4px solid #f97316; margin-bottom: 30px;">
            <strong>Need instant assistance?</strong> You can call us directly or click the button below to reach us on WhatsApp.
          </div>

          <div style="text-align: center; margin-bottom: 10px;">
            <a href="https://wa.me/919150549150?text=Hi%20Ayyappa%20Travels,%20I%20have%20submitted%20a%20message%20enquiry%20from%20your%20website%20under%20the%20name%20${encodeURIComponent(enquiry.name)}." style="background-color: #25d366; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(37,211,102,0.2); transition: all 0.2s ease;">
              💬 Chat via WhatsApp
            </a>
          </div>
        </div>
        <div style="background-color: #0f172a; padding: 25px 20px; text-align: center; color: #94a3b8; font-size: 12.5px;">
          <p style="margin: 0 0 8px; color: #ffffff; font-weight: 600; font-size: 14px;">Ayyappa Travels Srivilliputtur</p>
          <p style="margin: 0 0 8px;">54 D, Ayyampatti Sekkadi Street, Near PRC Tippo, Ayyampatti, Srivilliputtur-626125, Tamil Nadu</p>
          <p style="margin: 0;">Call/WhatsApp: +91-9150549150 | Email: kan93095@gmail.com</p>
        </div>
      </div>
    `;

    // Try sending email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Ayyappa Travels" <kan93095@gmail.com>',
      to: enquiry.email,
      subject: `Thank you for your enquiry - Ayyappa Travels`,
      html: emailHtml,
    });

    console.log(`✓ Nodemailer Thank You Email Sent: ${info.messageId}`);
  } catch (emailErr) {
    console.error('❌ Thank You Email Error:');
    console.error('  Message :', emailErr.message);
    console.error('  Code    :', emailErr.code);
    console.error('  Response:', emailErr.response || 'N/A');
  }
};

router.post('/', async (req, res) => {
  // Validate req body
  const { error, value } = enquirySchemaJoi.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const newEnquiry = await Enquiry.create(value);

    // Send thank you email (runs asynchronously)
    sendThankYouEmail(newEnquiry);

    res.status(201).json({
      success: true,
      message: 'Your message has been submitted successfully! We have sent a confirmation email.',
      data: newEnquiry,
    });
  } catch (error) {
    console.error('Create Enquiry Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error submitting enquiry' });
  }
});

// GET all enquiries (for Admin Dashboard)
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Fetch Enquiries Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching enquiries' });
  }
});

export default router;
