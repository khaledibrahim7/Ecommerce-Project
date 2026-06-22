package com.sowar.store.service;

import com.sowar.store.dto.*;
import com.sowar.store.security.CurrentUser;

public interface CartService {

    CartResponse getCart(CurrentUser currentUser);

    CartResponse addOrUpdate(CurrentUser currentUser, CartItemRequest request);

    void remove(CurrentUser currentUser, Long productId);

    void clear(CurrentUser currentUser);
}

