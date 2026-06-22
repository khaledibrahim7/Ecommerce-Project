package com.sowar.store.service.impl;

import com.sowar.store.entity.Category;
import com.sowar.store.entity.Product;
import com.sowar.store.service.LowStockNotificationService;
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
public class LowStockNotificationServiceImpl implements LowStockNotificationService {

    private static final Logger log = LoggerFactory.getLogger(LowStockNotificationServiceImpl.class);


    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.to:}")
    private String to;

    @Value("${spring.mail.from:}")
    private String from;

    @Value("${spring.mail.host:}")
    private String host;



    public void notifyIfLow(Product product) {
        if (product.getStockQuantity() > product.getLowStockThreshold()) {
            product.setLowStockAlertSent(false);
            return;
        }
        if (product.isLowStockAlertSent()) {
            return;
        }

        send(product);
        product.setLowStockAlertSent(true);
    }

    private void send(Product product) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || host == null || host.isBlank() || to == null || to.isBlank()) {
            log.warn("Low stock alert skipped for product {} because mail is not configured", product.getName());
            return;
        }

        Category category = product.getCategory();
        String categoryName = category == null ? "بدون تصنيف" : category.getName();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("تنبيه استوك منخفض - " + product.getName());
        message.setText("""
                مرحبا،

                المنتج التالي اقترب من النفاد:

                اسم المنتج: %s
                التصنيف: %s
                الكمية الحالية: %d
                حد التنبيه: %d

                برجاء مراجعة المخزون وتجهيز كمية جديدة حتى لا يتوقف البيع.

                سوار
                """.formatted(
                product.getName(),
                categoryName,
                product.getStockQuantity(),
                product.getLowStockThreshold()
        ));

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            log.warn("Failed to send low stock alert for product {}", product.getName(), exception);
        }
    }
}
