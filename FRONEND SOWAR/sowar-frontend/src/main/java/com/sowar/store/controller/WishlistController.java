package com.sowar.store.controller;

import com.sowar.store.dto.*;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.service.WishlistService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    List<ProductResponse> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return wishlistService.list(currentUser);
    }

    @PostMapping("/{productId}")
    void add(@AuthenticationPrincipal CurrentUser currentUser, @PathVariable Long productId) {
        wishlistService.add(currentUser, productId);
    }

    @DeleteMapping("/{productId}")
    void remove(@AuthenticationPrincipal CurrentUser currentUser, @PathVariable Long productId) {
        wishlistService.remove(currentUser, productId);
    }
}
