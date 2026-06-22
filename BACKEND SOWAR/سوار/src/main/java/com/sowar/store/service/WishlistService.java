package com.sowar.store.service;

import com.sowar.store.dto.*;
import com.sowar.store.security.CurrentUser;

import java.util.List;

public interface WishlistService  {
    List<ProductResponse> list(CurrentUser currentUser);

    void add(CurrentUser currentUser, Long productId);

    void remove(CurrentUser currentUser, Long productId);
}

