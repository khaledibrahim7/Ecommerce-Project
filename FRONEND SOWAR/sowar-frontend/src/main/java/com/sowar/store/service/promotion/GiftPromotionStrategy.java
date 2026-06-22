package com.sowar.store.service.promotion;

import com.sowar.store.common.ApiException;
import com.sowar.store.common.InsufficientStockException;
import com.sowar.store.dto.ProductRequest;
import com.sowar.store.entity.OrderItem;
import com.sowar.store.entity.Product;
import com.sowar.store.entity.enums.PromotionType;
import com.sowar.store.repository.ProductRepository;
import com.sowar.store.service.LowStockNotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class GiftPromotionStrategy implements PromotionStrategy {

    @Override
    public boolean supports(PromotionType type) {
        return type == PromotionType.GIFT_PRODUCT || type == PromotionType.DISCOUNT_AND_GIFT;
    }

    @Override
    public void validateConfig(Product product, ProductRequest request, ProductRepository productRepository) {
        if (request.giftProductId() == null || request.giftQuantity() == null || request.giftQuantity() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Gift product and quantity are required for this promotion type");
        }
        if (product.getId() != null && product.getId().equals(request.giftProductId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Gift product cannot be the same product");
        }
        Product giftProduct = productRepository.findById(request.giftProductId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Gift product not found"));
        product.setGiftProduct(giftProduct);
    }

    @Override
    public void applyOnOrderCreation(Product product, int orderQuantity, LowStockNotificationService notificationService) {
        Product giftProduct = product.getGiftProduct();
        int giftQuantity = product.getGiftQuantity() == null ? 0 : product.getGiftQuantity();
        int totalGiftQuantity = giftQuantity * orderQuantity;
        
        if (giftProduct == null || totalGiftQuantity <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Gift offer is not configured correctly for " + product.getName());
        }
        if (giftProduct.getStockQuantity() < totalGiftQuantity) {
            throw new InsufficientStockException("Not enough gift stock for " + giftProduct.getName());
        }
        
        giftProduct.setStockQuantity(giftProduct.getStockQuantity() - totalGiftQuantity);
        notificationService.notifyIfLow(giftProduct);
    }

    @Override
    public void restoreStockOnCancel(OrderItem item, ProductRepository productRepository, LowStockNotificationService notificationService) {
        if (item.getGiftProductId() != null && item.getGiftQuantity() != null && item.getGiftQuantity() > 0) {
            productRepository.findById(item.getGiftProductId()).ifPresent(giftProduct -> {
                giftProduct.setStockQuantity(giftProduct.getStockQuantity() + (item.getGiftQuantity() * item.getQuantity()));
                notificationService.notifyIfLow(giftProduct);
            });
        }
    }
}
