package com.sowar.store.dto;

public record ContactLinkResponse(
        Long id,
        String label,
        String platform,
        String value,
        boolean active,
        int sortOrder
) {}
