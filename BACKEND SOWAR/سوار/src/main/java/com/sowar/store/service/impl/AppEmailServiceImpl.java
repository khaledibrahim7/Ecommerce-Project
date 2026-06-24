package com.sowar.store.service.impl;

import com.sowar.store.service.AppEmailService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppEmailServiceImpl implements AppEmailService {

    private static final Logger log = LoggerFactory.getLogger(AppEmailServiceImpl.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.from:}")
    private String from;

    @Value("${spring.mail.host:}")
    private String host;

    @Value("${spring.mail.to:}")
    private String adminTo;

    @Override
    public void send(String to, String subject, String body) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || host == null || host.isBlank() || to == null || to.isBlank()) {
            log.warn("Email skipped: mail is not configured or recipient is empty. subject={}", subject);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (from != null && !from.isBlank()) {
            message.setFrom(from);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            log.warn("Failed to send email to {} with subject {}", to, subject, exception);
        }
    }

    @Override
    public void sendAdminMail(String subject, String body) {
        send(adminTo, subject, body);
    }
}
