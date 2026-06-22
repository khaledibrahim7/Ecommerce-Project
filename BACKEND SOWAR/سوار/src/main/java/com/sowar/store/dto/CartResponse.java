package com.sowar.store.dto;


import java.math.BigDecimal;
import java.util.List;

public record CartResponse(List<Item> items, BigDecimal subtotal) {

    public record Item(
            Long productId,
            String productName,
            String imageUrl,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal originalUnitPrice,
            boolean hasDiscount,
            BigDecimal lineTotal,
            int availableStock
    ) {
    }
}
