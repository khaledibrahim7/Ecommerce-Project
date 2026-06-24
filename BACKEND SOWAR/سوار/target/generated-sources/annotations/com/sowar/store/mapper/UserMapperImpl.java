package com.sowar.store.mapper;

import com.sowar.store.dto.Address;
import com.sowar.store.dto.UserResponse;
import com.sowar.store.entity.User;
import java.time.Instant;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-24T21:42:52+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        Address address = null;
        Long id = null;
        String fullName = null;
        String phone = null;
        String email = null;
        String role = null;
        Instant createdAt = null;
        Instant updatedAt = null;
        Instant deletedAt = null;

        address = mapAddress( user );
        id = user.getId();
        fullName = user.getFullName();
        phone = user.getPhone();
        email = user.getEmail();
        if ( user.getRole() != null ) {
            role = user.getRole().name();
        }
        createdAt = user.getCreatedAt();
        updatedAt = user.getUpdatedAt();
        deletedAt = user.getDeletedAt();

        UserResponse userResponse = new UserResponse( id, fullName, phone, email, role, createdAt, updatedAt, deletedAt, address );

        return userResponse;
    }
}
