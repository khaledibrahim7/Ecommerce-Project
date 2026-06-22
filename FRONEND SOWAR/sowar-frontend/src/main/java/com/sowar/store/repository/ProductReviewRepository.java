package com.sowar.store.repository;

import com.sowar.store.entity.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    @EntityGraph(attributePaths = {"customer", "product"})
    List<ProductReview> findByProductIdAndApprovedTrueAndDeletedFalseOrderByCreatedAtDesc(Long productId);

    @EntityGraph(attributePaths = {"customer", "product"})
    List<ProductReview> findByDeletedFalseOrderByCreatedAtDesc();
}
