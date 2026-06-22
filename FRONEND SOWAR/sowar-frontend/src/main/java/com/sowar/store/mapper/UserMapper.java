package com.sowar.store.mapper;

import com.sowar.store.dto.UserResponse;
import com.sowar.store.dto.Address;
import com.sowar.store.entity.AddressDetails;
import com.sowar.store.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "address", source = "user", qualifiedByName = "mapAddress")
    UserResponse toResponse(User user);

    @Named("mapAddress")
    default Address mapAddress(User user) {
        if (user.getDefaultGovernorate() == null && user.getDefaultAddress() == null) {
            return null;
        }
        var gov = user.getDefaultGovernorate();
        var details = user.getDefaultAddress();
        
        return new Address(
                gov != null ? gov.getId() : null,
                gov != null ? gov.getName() : null,
                details != null ? details.getCity() : null,
                details != null ? details.getArea() : null,
                details != null ? details.getStreet() : null,
                details != null ? details.getBuildingNumber() : null,
                details != null ? details.getFloor() : null,
                details != null ? details.getApartment() : null,
                details != null ? details.getLandmark() : null,
                details != null ? details.getAddressType() : null,
                details != null ? details.getDeliveryNotes() : null
        );
    }
}