package com.sowar.store.dto;

import lombok.Builder;

import java.time.Instant;

@Builder
public record QuestionResponse(
        Long id,
        Long productId,
        String productName,
        String customerName,
        String question,
        String answer,
        boolean answered,
        Instant createdAt
) {}
