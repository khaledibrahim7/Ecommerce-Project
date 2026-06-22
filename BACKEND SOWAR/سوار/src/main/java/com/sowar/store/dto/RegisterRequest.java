package com.sowar.store.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank String phone,
        @Email @NotBlank String email,
        @Size(min = 8) String password,
        @Valid @NotNull AddressRequest address
) {
}
