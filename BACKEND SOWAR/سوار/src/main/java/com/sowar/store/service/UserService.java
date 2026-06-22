package com.sowar.store.service;

import com.sowar.store.dto.*;
import com.sowar.store.entity.AddressDetails;
import com.sowar.store.entity.User;
import com.sowar.store.security.CurrentUser;

public interface UserService {

    UserResponse me(CurrentUser currentUser);

    UserResponse updateMe(CurrentUser currentUser, UpdateProfileRequest request);

    void changePassword(CurrentUser currentUser, ChangePasswordRequest request);

    void applyProfile(User user, String fullName, String phone, String email, AddressRequest addressRequest);

    AddressDetails toAddressDetails(AddressRequest request);

    void deleteMe(CurrentUser currentUser);
}
