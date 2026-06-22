package com.sowar.store.service;

import com.sowar.store.dto.*;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(AuthRequest request);
}

