package com.sowar.store.mapper;

import com.sowar.store.dto.ShippingGovernorateResponse;
import com.sowar.store.entity.ShippingGovernorate;
import java.math.BigDecimal;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-25T02:59:23+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class ShippingGovernorateMapperImpl implements ShippingGovernorateMapper {

    @Override
    public ShippingGovernorateResponse toResponse(ShippingGovernorate governorate) {
        if ( governorate == null ) {
            return null;
        }

        Long id = null;
        String name = null;
        BigDecimal shippingFee = null;
        boolean active = false;

        id = governorate.getId();
        name = governorate.getName();
        shippingFee = governorate.getShippingFee();
        active = governorate.isActive();

        ShippingGovernorateResponse shippingGovernorateResponse = new ShippingGovernorateResponse( id, name, shippingFee, active );

        return shippingGovernorateResponse;
    }
}
