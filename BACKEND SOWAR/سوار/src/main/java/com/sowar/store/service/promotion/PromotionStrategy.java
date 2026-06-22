package com.sowar.store.service.promotion;

import com.sowar.store.dto.ProductRequest;
import com.sowar.store.entity.OrderItem;
import com.sowar.store.entity.Product;
import com.sowar.store.entity.enums.PromotionType;
import com.sowar.store.repository.ProductRepository;
import com.sowar.store.service.LowStockNotificationService;

public interface PromotionStrategy {
    boolean supports(PromotionType type);
    
    void validateConfig(Product product, ProductRequest request, ProductRepository productRepository);
    
    void applyOnOrderCreation(Product product, int orderQuantity, LowStockNotificationService notificationService);
    
    void restoreStockOnCancel(OrderItem item, ProductRepository productRepository, LowStockNotificationService notificationService);
}
