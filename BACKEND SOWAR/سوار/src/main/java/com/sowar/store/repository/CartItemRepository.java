package com.sowar.store.repository;


import com.sowar.store.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(Long customerId);

    Optional<CartItem> findByCustomerIdAndProductId(Long customerId, Long productId);

    Optional<CartItem> findByCustomerIdAndProductIdAndDeletedFalse(Long customerId, Long productId);

    void deleteByCustomerIdAndProductId(Long customerId, Long productId);

    void deleteByCustomerId(Long customerId);
}
