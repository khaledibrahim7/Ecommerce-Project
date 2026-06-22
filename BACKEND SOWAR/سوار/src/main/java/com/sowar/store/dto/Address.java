package com.sowar.store.dto;

import com.sowar.store.entity.enums.AddressType;

public record Address(
            Long governorateId,
            String governorateName,
            String city,
            String area,
            String street,
            String buildingNumber,
            String floor,
            String apartment,
            String landmark,
            AddressType addressType,
            String deliveryNotes
    ) {}
