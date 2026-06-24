package com.sowar.store.service.impl;

import com.sowar.store.entity.Category;
import com.sowar.store.entity.Product;
import com.sowar.store.service.AppEmailService;
import com.sowar.store.service.LowStockNotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LowStockNotificationServiceImpl implements LowStockNotificationService {

    private static final Logger log = LoggerFactory.getLogger(LowStockNotificationServiceImpl.class);


    private final AppEmailService appEmailService;



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
        Category category = product.getCategory();
        String categoryName = category == null ? "بدون تصنيف" : category.getName();

        appEmailService.sendAdminMail("تنبيه استوك منخفض - " + product.getName(), """
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
    }
}
