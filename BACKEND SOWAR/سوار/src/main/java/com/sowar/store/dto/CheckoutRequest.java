package com.sowar.store.dto;

import jakarta.validation.Valid;

public record CheckoutRequest(
        @Valid AddressRequest deliveryAddress,
        String notes,
        String paymentMethod
) {
}
