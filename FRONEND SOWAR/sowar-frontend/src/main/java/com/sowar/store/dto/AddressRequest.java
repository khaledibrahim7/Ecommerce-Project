package com.sowar.store.dto;


import com.sowar.store.entity.enums.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddressRequest(
        @NotNull Long governorateId,
        @NotBlank String city,
        @NotBlank String area,
        @NotBlank String street,
        @NotBlank String buildingNumber,
        String floor,
        String apartment,
        String landmark,
        AddressType addressType,
        String deliveryNotes
) {
}
