package com.sowar.store.service.impl;




import com.sowar.store.dto.*;
import com.sowar.store.entity.*;
import com.sowar.store.entity.enums.AddressType;
import com.sowar.store.mapper.UserMapper;
import com.sowar.store.repository.*;
import com.sowar.store.common.ApiException;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.entity.ShippingGovernorate;
import com.sowar.store.service.ShippingService;
import com.sowar.store.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ShippingService shippingService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;



    @Transactional(readOnly = true)
    public UserResponse me(CurrentUser currentUser) {
        return userMapper.toResponse(findUser(currentUser.id()));
    }

    @Transactional
    public UserResponse updateMe(CurrentUser currentUser, UpdateProfileRequest request) {
        User user = findUser(currentUser.id());
        if (userRepository.existsByEmailAndIdNot(request.email(), user.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (userRepository.existsByPhoneAndIdNot(request.phone(), user.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone already exists");
        }
        applyProfile(user, request.fullName(), request.phone(), request.email(), request.address());
        return userMapper.toResponse(user);
    }

    @Transactional
    public void changePassword(CurrentUser currentUser, ChangePasswordRequest request) {
        User user = findUser(currentUser.id());
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is not correct");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    public void applyProfile(User user, String fullName, String phone, String email, AddressRequest addressRequest) {
        ShippingGovernorate governorate = shippingService.find(addressRequest.governorateId());
        user.setFullName(fullName);
        user.setPhone(phone);
        user.setEmail(email);
        user.setDefaultGovernorate(governorate);
        user.setDefaultAddress(toAddressDetails(addressRequest));
    }

    public AddressDetails toAddressDetails(AddressRequest request) {
        AddressDetails details = new AddressDetails();
        details.setCity(request.city());
        details.setArea(request.area());
        details.setStreet(request.street());
        details.setBuildingNumber(request.buildingNumber());
        details.setFloor(request.floor());
        details.setApartment(request.apartment());
        details.setLandmark(request.landmark());
        details.setAddressType(request.addressType() == null ? AddressType.HOME : request.addressType());
        details.setDeliveryNotes(request.deliveryNotes());
        return details;
    }

    @Transactional
    public void deleteMe(CurrentUser currentUser) {
        User user = findUser(currentUser.id());
        // soft-delete: set deleted flag and timestamp
        user.setDeleted(true);
        user.setDeletedAt(java.time.Instant.now());
        user.setEnabled(false);
    }
    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}


