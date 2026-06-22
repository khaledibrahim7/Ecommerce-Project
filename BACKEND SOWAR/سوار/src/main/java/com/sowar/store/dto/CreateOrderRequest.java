package com.sowar.store.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record CreateOrderRequest(
        @Valid AddressRequest deliveryAddress,
        String notes,
        @NotEmpty List<@Valid OrderItemRequest> items
) {
    public record OrderItemRequest(@NotNull Long productId, @Positive int quantity) {
    }
}
