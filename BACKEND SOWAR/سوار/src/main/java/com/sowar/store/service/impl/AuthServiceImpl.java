package com.sowar.store.service.impl;




import com.sowar.store.dto.*;
import com.sowar.store.common.ApiException;
import com.sowar.store.security.JwtService;
import com.sowar.store.entity.User;
import com.sowar.store.repository.UserRepository;
import com.sowar.store.entity.enums.UserRole;
import com.sowar.store.service.AuthService;
import com.sowar.store.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;



    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (userRepository.existsByPhone(request.phone())) {
            throw new ApiException(HttpStatus.CONFLICT, "Phone already exists");
        }
        User user = new User();
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.CUSTOMER);
        userService.applyProfile(user, request.fullName(), request.phone(), request.email(), request.address());
        return toResponse(userRepository.save(user));
    }

    public AuthResponse login(AuthRequest request) {
        Optional<User> matchedUser = switch (request.loginType()) {
            case EMAIL -> userRepository.findByEmail(request.identifier());
            case PHONE -> userRepository.findByPhone(request.identifier());
        };
        User user = matchedUser.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email/phone or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email/phone or password");
        }
        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(jwtService.generate(user), user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }
}
