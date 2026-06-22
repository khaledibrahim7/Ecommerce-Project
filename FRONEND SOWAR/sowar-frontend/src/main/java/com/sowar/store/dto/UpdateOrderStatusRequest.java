package com.sowar.store.dto;


import com.sowar.store.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull OrderStatus status, String note) {
}
