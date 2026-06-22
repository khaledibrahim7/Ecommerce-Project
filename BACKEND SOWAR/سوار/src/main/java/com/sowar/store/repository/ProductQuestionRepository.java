package com.sowar.store.repository;

import com.sowar.store.entity.ProductQuestion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductQuestionRepository extends JpaRepository<ProductQuestion, Long> {

    @EntityGraph(attributePaths = {"customer", "product"})
    List<ProductQuestion> findByProductIdOrderByCreatedAtDesc(Long productId);

    @Override
    @EntityGraph(attributePaths = {"customer", "product"})
    List<ProductQuestion> findAll();
}
