package com.cafeteria.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("CafeteriaHub - Email Verification");
        message.setText("Your OTP for email verification is: " + otp + 
                       "\n\nThis OTP will expire in 10 minutes." +
                       "\n\nIf you didn't request this, please ignore this email.");
        
        mailSender.send(message);
    }

    public void sendOrderStatusEmail(String to, String customerName, Long orderId, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("CafeteriaHub - Order Update #" + orderId);
        
        String statusMessage = getStatusMessage(status);
        message.setText("Hi " + customerName + ",\n\n" +
                       "Your order #" + orderId + " status has been updated to: " + status + "\n\n" +
                       statusMessage + "\n\n" +
                       "Thank you for using CafeteriaHub!");
        
        mailSender.send(message);
    }

    public void sendOrderConfirmationEmail(String to, String customerName, Long orderId, double totalAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("CafeteriaHub - Order Confirmation #" + orderId);
        message.setText("Hi " + customerName + ",\n\n" +
                       "Thank you for your order! Your order #" + orderId + " has been confirmed.\n\n" +
                       "Total Amount: $" + String.format("%.2f", totalAmount) + "\n\n" +
                       "We'll notify you when your order is ready for pickup.\n\n" +
                       "Thank you for using CafeteriaHub!");
        
        mailSender.send(message);
    }

    private String getStatusMessage(String status) {
        switch (status) {
            case "CONFIRMED":
                return "Your order has been confirmed and is being prepared.";
            case "PREPARING":
                return "Your order is currently being prepared by our kitchen staff.";
            case "READY":
                return "Your order is ready for pickup! Please come to the cafeteria counter.";
            case "DELIVERED":
                return "Your order has been delivered. Enjoy your meal!";
            case "CANCELLED":
                return "Your order has been cancelled. If you have any questions, please contact us.";
            default:
                return "Your order status has been updated.";
        }
    }
}