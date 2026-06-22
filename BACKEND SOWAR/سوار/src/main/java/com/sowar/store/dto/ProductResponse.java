package com.sowar.store.dto;

import com.sowar.store.entity.enums.PromotionType;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record ProductResponse(
        Long id,
        String name,
        String description,
        String weight,
        String ingredients,
        String usageInstructions,
        String storageInstructions,
        String origin,
        boolean featured,
        int sortOrder,
        BigDecimal price,
        BigDecimal originalPrice,
        boolean hasDiscount,
        BigDecimal cost,
        PromotionType promotionType,
        String promotionTitle,
        String promotionDescription,
        Long giftProductId,
        String giftProductName,
        Integer giftQuantity,
        int stockQuantity,
        int lowStockThreshold,
        boolean lowStock,
        boolean lowStockAlertSent,
        boolean active,
        Long categoryId,
        String categoryName,
        List<String> imageUrls
) {}
