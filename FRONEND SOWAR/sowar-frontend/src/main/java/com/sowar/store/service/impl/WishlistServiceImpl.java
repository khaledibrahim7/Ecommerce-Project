package com.sowar.store.service.impl;

import com.sowar.store.common.*;
import com.sowar.store.dto.*;
import com.sowar.store.entity.*;
import com.sowar.store.repository.*;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.mapper.ProductMapper;
import com.sowar.store.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;



    @Transactional(readOnly = true)
    public List<ProductResponse> list(CurrentUser currentUser) {
        return wishlistItemRepository.findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(currentUser.id())
                .stream()
                .map(item -> productMapper.toResponse(item.getProduct()))
                .toList();
    }

    @Transactional
    public void add(CurrentUser currentUser, Long productId) {
        if (wishlistItemRepository.findByCustomerIdAndProductIdAndDeletedFalse(currentUser.id(), productId).isPresent()) {
            return;
        }
        var existingDeleted = wishlistItemRepository.findByCustomerIdAndProductId(currentUser.id(), productId);
        if (existingDeleted.isPresent()) {
            WishlistItem item = existingDeleted.get();
            item.setDeleted(false);
            item.setDeletedAt(null);
            wishlistItemRepository.save(item);
            return;
        }
        User customer = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        WishlistItem item = new WishlistItem();
        item.setCustomer(customer);
        item.setProduct(product);
        wishlistItemRepository.save(item);
    }

    @Transactional
    public void remove(CurrentUser currentUser, Long productId) {
        wishlistItemRepository.findByCustomerIdAndProductIdAndDeletedFalse(currentUser.id(), productId).ifPresent(item -> {
            item.setDeleted(true);
            item.setDeletedAt(Instant.now());
            wishlistItemRepository.save(item);
        });
    }
}
