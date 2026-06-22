package com.sowar.store.dto;


public record AuthResponse(
        String token,
        Long userId,
        String fullName,
        String email,
        String role
) {
}
