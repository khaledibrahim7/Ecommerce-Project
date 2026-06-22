package com.sowar.store.dto;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long productId,
        String productName,
        String customerName,
        int rating,
        String comment,
        Instant createdAt
) {}
