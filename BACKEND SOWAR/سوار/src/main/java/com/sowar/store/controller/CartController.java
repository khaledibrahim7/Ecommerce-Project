package com.sowar.store.controller;




import com.sowar.store.dto.*;
import com.sowar.store.service.*;
import com.sowar.store.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    CartResponse getCart(@AuthenticationPrincipal CurrentUser currentUser) {
        return cartService.getCart(currentUser);
    }

    @PostMapping("/items")
    CartResponse addOrUpdate(@AuthenticationPrincipal CurrentUser currentUser, @Valid @RequestBody CartItemRequest request) {
        return cartService.addOrUpdate(currentUser, request);
    }

    @DeleteMapping("/items/{productId}")
    void remove(@AuthenticationPrincipal CurrentUser currentUser, @PathVariable Long productId) {
        cartService.remove(currentUser, productId);
    }

    @DeleteMapping
    void clear(@AuthenticationPrincipal CurrentUser currentUser) {
        cartService.clear(currentUser);
    }
}
