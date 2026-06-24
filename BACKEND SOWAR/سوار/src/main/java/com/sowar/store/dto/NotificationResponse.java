package com.sowar.store.dto;

import com.sowar.store.entity.enums.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        NotificationType type,
        String title,
        String message,
        String targetUrl,
        boolean read,
        Instant createdAt
) {}
