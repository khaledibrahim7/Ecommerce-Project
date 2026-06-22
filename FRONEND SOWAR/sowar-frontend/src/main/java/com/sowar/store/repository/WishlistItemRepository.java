package com.sowar.store.repository;

import com.sowar.store.entity.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    @EntityGraph(attributePaths = {"product", "product.imageUrls", "product.category", "product.giftProduct"})
    List<WishlistItem> findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(Long customerId);

    Optional<WishlistItem> findByCustomerIdAndProductId(Long customerId, Long productId);

    Optional<WishlistItem> findByCustomerIdAndProductIdAndDeletedFalse(Long customerId, Long productId);

    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
}
