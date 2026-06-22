package com.sowar.store.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateProfileRequest(
        @NotBlank String fullName,
        @NotBlank String phone,
        @Email @NotBlank String email,
        @Valid @NotNull AddressRequest address
) {
}
