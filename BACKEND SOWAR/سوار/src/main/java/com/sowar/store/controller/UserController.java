package com.sowar.store.controller;




import com.sowar.store.dto.*;
import com.sowar.store.service.*;
import com.sowar.store.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    UserResponse me(@AuthenticationPrincipal CurrentUser currentUser) {
        return userService.me(currentUser);
    }

    @PutMapping
    UserResponse updateMe(@AuthenticationPrincipal CurrentUser currentUser, @Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateMe(currentUser, request);
    }

    @PutMapping("/password")
    void changePassword(@AuthenticationPrincipal CurrentUser currentUser, @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(currentUser, request);
    }

    @org.springframework.web.bind.annotation.DeleteMapping
    void deleteMe(@AuthenticationPrincipal CurrentUser currentUser) {
        userService.deleteMe(currentUser);
    }
}
