package com.sowar.store.dto;

import java.time.Instant;

/**
 * Response DTO for current user. Includes audit timestamps so callers can see
 * when the account was created, last updated and (if applicable) deleted.
 */
public record UserResponse(
        Long id,
        String fullName,
        String phone,
        String email,
        String role,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt,
        Address address
) {}

