package com.sowar.store.mapper;

import com.sowar.store.dto.ShippingGovernorateResponse;
import com.sowar.store.entity.ShippingGovernorate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ShippingGovernorateMapper {
    ShippingGovernorateResponse toResponse(ShippingGovernorate governorate);
}