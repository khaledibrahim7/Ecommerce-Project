package com.sowar.store.service.impl;




import com.sowar.store.dto.*;
import com.sowar.store.entity.*;
import com.sowar.store.repository.*;
import com.sowar.store.entity.Product;
import com.sowar.store.repository.ProductRepository;
import com.sowar.store.common.ApiException;
import com.sowar.store.common.InsufficientStockException;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.entity.User;
import com.sowar.store.repository.UserRepository;
import com.sowar.store.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;



    @Transactional(readOnly = true)
    public CartResponse getCart(CurrentUser currentUser) {
        return toResponse(cartItemRepository.findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(currentUser.id()));
    }

    @Transactional
    public CartResponse addOrUpdate(CurrentUser currentUser, CartItemRequest request) {
        User customer = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!product.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product is not active");
        }
        if (product.getStockQuantity() < request.quantity()) {
            throw new InsufficientStockException("Not enough stock for " + product.getName());
        }
        CartItem item = cartItemRepository.findByCustomerIdAndProductIdAndDeletedFalse(currentUser.id(), request.productId())
                .orElseGet(() -> cartItemRepository.findByCustomerIdAndProductId(currentUser.id(), request.productId())
                        .map(existing -> {
                            existing.setDeleted(false);
                            existing.setDeletedAt(null);
                            return existing;
                        })
                        .orElseGet(CartItem::new));
        item.setCustomer(customer);
        item.setProduct(product);
        item.setQuantity(request.quantity());
        cartItemRepository.save(item);
        return getCart(currentUser);
    }

    @Transactional
    public void remove(CurrentUser currentUser, Long productId) {
        cartItemRepository.findByCustomerIdAndProductIdAndDeletedFalse(currentUser.id(), productId).ifPresent(item -> {
            item.setDeleted(true);
            item.setDeletedAt(Instant.now());
            cartItemRepository.save(item);
        });
    }

    @Transactional
    public void clear(CurrentUser currentUser) {
        List<CartItem> items = cartItemRepository.findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(currentUser.id());
        items.forEach(item -> {
            item.setDeleted(true);
            item.setDeletedAt(Instant.now());
        });
        cartItemRepository.saveAll(items);
    }

    private CartResponse toResponse(List<CartItem> items) {
        BigDecimal subtotal = BigDecimal.ZERO;
        List<CartResponse.Item> responseItems = items.stream().map(item -> {
            Product product = item.getProduct();
            BigDecimal price = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
            BigDecimal originalPrice = product.getOriginalPrice();
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
            String imageUrl = product.getImageUrls() == null || product.getImageUrls().isEmpty() ? null : product.getImageUrls().get(0);
            return new CartResponse.Item(
                    product.getId(),
                    product.getName(),
                    imageUrl,
                    item.getQuantity(),
                    price,
                    originalPrice,
                    originalPrice != null && originalPrice.compareTo(price) > 0,
                    lineTotal,
                    product.getStockQuantity()
            );
        }).toList();
        for (CartResponse.Item item : responseItems) {
            subtotal = subtotal.add(item.lineTotal());
        }
        return new CartResponse(responseItems, subtotal);
    }
}
