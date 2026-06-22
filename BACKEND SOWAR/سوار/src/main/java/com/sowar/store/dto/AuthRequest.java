package com.sowar.store.dto;


import com.sowar.store.entity.enums.LoginType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AuthRequest(
        @NotNull LoginType loginType,
        @NotBlank String identifier,
        @NotBlank String password
) {
}
