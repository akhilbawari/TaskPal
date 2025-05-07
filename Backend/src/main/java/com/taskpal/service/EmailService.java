package com.taskpal.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service for sending emails.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.email.verification.url}")
    private String verificationBaseUrl;

    /**
     * Send an email verification message to the user.
     *
     * @param to the recipient's email address
     * @param name the recipient's name
     * @param token the verification token
     */
    @Async
    public void sendVerificationEmail(String to, String name, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Email Verification");
            
            String verificationUrl = verificationBaseUrl + "?token=" + token;
            String content = buildVerificationEmailContent(name, verificationUrl);
            
            helper.setText(content, true);
            
            mailSender.send(message);
            logger.info("Verification email sent to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send verification email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Build the HTML content for the verification email.
     *
     * @param name the recipient's name
     * @param verificationUrl the verification URL
     * @return the HTML content
     */
    private String buildVerificationEmailContent(String name, String verificationUrl) {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>"
                + "<h2>Hello, " + name + "!</h2>"
                + "<p>Thank you for registering. Please click the button below to verify your email address:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + verificationUrl + "' style='background-color: #4CAF50; color: white; padding: 12px 20px; "
                + "text-decoration: none; border-radius: 4px; font-weight: bold;'>Verify Email</a>"
                + "</div>"
                + "<p>If the button doesn't work, you can also click on the link below or copy it into your browser:</p>"
                + "<p><a href='" + verificationUrl + "'>" + verificationUrl + "</a></p>"
                + "<p>This link will expire in 24 hours.</p>"
                + "<p>If you didn't create an account, you can ignore this email.</p>"
                + "<p>Best regards,<br>Your Application Team</p>"
                + "</div>";
    }
}