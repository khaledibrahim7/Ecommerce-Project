package com.sowar.store.dto;


import com.sowar.store.entity.enums.PromotionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @NotBlank String name,
        String description,
        String weight,
        String ingredients,
        String usageInstructions,
        String storageInstructions,
        String origin,
        boolean featured,
        @Min(0) int sortOrder,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        @DecimalMin("0.0") BigDecimal originalPrice,
        @DecimalMin("0.0") BigDecimal cost,
        PromotionType promotionType,
        String promotionTitle,
        String promotionDescription,
        Long giftProductId,
        @Min(0) Integer giftQuantity,
        @Min(0) int stockQuantity,
        @Min(0) int lowStockThreshold,
        Long categoryId,
        List<String> imageUrls,
        boolean active
) {
}
