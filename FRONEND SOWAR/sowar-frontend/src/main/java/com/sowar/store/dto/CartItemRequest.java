package com.sowar.store.dto;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CartItemRequest(@NotNull Long productId, @Positive int quantity) {
}
