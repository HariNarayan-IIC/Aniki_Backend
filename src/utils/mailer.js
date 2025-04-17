import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

export const sendMail = async ({to, subject, text, html}) => {
    try {
        const info = await transporter.sendMail({
            from: "Aniki",
            to,
            subject,
            text
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email: ', error);
        throw error;
    }
}

export const sendHtmlMail = async ({to, subject, htmlFilePath, variables}) => {
    try {
        const absolutePath = path.join(__dirname, "../../public", htmlFilePath);
        const htmlTemplate = await fs.readFile(absolutePath, 'utf-8');

        const compiledTemplate = handlebars.compile(htmlTemplate);
        const htmlContent = compiledTemplate(variables);

        const info = await transporter.sendMail({
            from: "Aniki",
            to,
            subject,
            html: htmlContent
        });

        console.log("Email sent: ", info.messageId);
        return info
    } catch (error) {
        console.error("Error sending html email: ", error);
        throw error;
        
    }
}