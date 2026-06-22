package com.sowar.store.entity;

import com.sowar.store.entity.enums.AddressType;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class AddressDetails {

    private String city;

    private String area;

    private String street;

    private String buildingNumber;

    private String floor;

    private String apartment;

    private String landmark;

    @Enumerated(EnumType.STRING)
    private AddressType addressType = AddressType.HOME;

    private String deliveryNotes;

    public String toSingleLine(String governorateName) {
        return java.util.stream.Stream.of(
                        governorateName,
                        city,
                        area,
                        street,
                        prefixed("Building", buildingNumber),
                        prefixed("Floor", floor),
                        prefixed("Apartment", apartment),
                        landmark
                )
                .filter(value -> value != null && !value.isBlank())
                .collect(java.util.stream.Collectors.joining(", "));
    }

    private String prefixed(String label, String value) {
        return value == null || value.isBlank() ? null : label + " " + value;
    }
}
