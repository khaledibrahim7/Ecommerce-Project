package com.sowar.store.service.promotion;

import com.sowar.store.dto.ProductRequest;
import com.sowar.store.entity.OrderItem;
import com.sowar.store.entity.Product;
import com.sowar.store.entity.enums.PromotionType;
import com.sowar.store.repository.ProductRepository;
import com.sowar.store.service.LowStockNotificationService;
import org.springframework.stereotype.Component;

@Component
public class NoOpPromotionStrategy implements PromotionStrategy {

    @Override
    public boolean supports(PromotionType type) {
        return type == PromotionType.NONE || type == PromotionType.DISCOUNT;
    }

    @Override
    public void validateConfig(Product product, ProductRequest request, ProductRepository productRepository) {
        // لا يوجد تحقق إضافي مطلوب للأنواع بدون هدايا
    }

    @Override
    public void applyOnOrderCreation(Product product, int orderQuantity, LowStockNotificationService notificationService) {
        // لا يوجد خصم من مخزون إضافي
    }

    @Override
    public void restoreStockOnCancel(OrderItem item, ProductRepository productRepository, LowStockNotificationService notificationService) {
        // لا يوجد استرجاع لمخزون إضافي
    }
}
