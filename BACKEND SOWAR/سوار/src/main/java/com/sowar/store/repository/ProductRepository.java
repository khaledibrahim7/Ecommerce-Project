package com.sowar.store.repository;


import com.sowar.store.entity.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    @EntityGraph(attributePaths = {"imageUrls", "category", "giftProduct"})
    List<Product> findByActiveTrueOrderBySortOrderAsc();

    @EntityGraph(attributePaths = {"imageUrls", "category", "giftProduct"})
    Optional<Product> findWithImagesById(Long id);


    boolean existsByCategoryId(Long categoryId);
}
