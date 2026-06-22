package com.sowar.store.dto;

import com.sowar.store.entity.enums.AddressType;
import com.sowar.store.entity.enums.OrderStatus;
import com.sowar.store.entity.enums.PromotionType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Builder
public record OrderResponse(
        Long id,
        Instant createdAt,
        String customerName,
        String customerPhone,
        String address,
        AddressDetailsResponse addressDetails,
        String governorate,
        OrderStatus status,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        BigDecimal estimatedProfit,
        String notes,
        List<Item> items,
        List<StatusHistory> statusHistory
) {
    @Builder
    public record Item(
            Long productId,
            String productName,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal originalUnitPrice,
            boolean hasDiscount,
            PromotionType promotionType,
            String promotionTitle,
            String promotionDescription,
            Long giftProductId,
            String giftProductName,
            Integer giftQuantity,
            BigDecimal lineTotal
    ) {}

    @Builder
    public record AddressDetailsResponse(
            String city,
            String area,
            String street,
            String buildingNumber,
            String floor,
            String apartment,
            String landmark,
            AddressType addressType,
            String deliveryNotes
    ) {}

    @Builder
    public record StatusHistory(OrderStatus status, String note, Instant createdAt) {}
}
