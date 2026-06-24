package com.sowar.store.dto;

import jakarta.validation.constraints.NotBlank;

public record ContactLinkRequest(
        @NotBlank String label,
        @NotBlank String platform,
        @NotBlank String value,
        boolean active,
        int sortOrder
) {}
