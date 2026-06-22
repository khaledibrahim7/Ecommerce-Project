package com.sowar.store.dto;

import java.time.Instant;

public record CheckoutResponse(
        Long orderId,
        String message,
        String status,
        OrderResponse orderDetails,
        Instant timestamp
) {
    public static CheckoutResponse success(OrderResponse order) {
        return new CheckoutResponse(
                order.id(),
                "تم قبول طلبك بنجاح. سيتم التواصل بك لتوصيل الأوردر خلال أيام.",
                "SUCCESS",
                order,
                Instant.now()
        );
    }
}

