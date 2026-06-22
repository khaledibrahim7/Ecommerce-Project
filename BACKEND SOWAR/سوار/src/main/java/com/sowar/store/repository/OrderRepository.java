package com.sowar.store.repository;


import com.sowar.store.entity.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"shippingGovernorate", "items", "items.product"})
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @EntityGraph(attributePaths = {"shippingGovernorate", "items", "items.product"})
    java.util.Optional<Order> findByIdAndCustomerId(Long id, Long customerId);

    @Override
    @EntityGraph(attributePaths = {"shippingGovernorate", "items", "items.product"})
    List<Order> findAll();

    @Override
    @EntityGraph(attributePaths = {"shippingGovernorate", "items", "items.product"})
    java.util.Optional<Order> findById(Long id);

    boolean existsByShippingGovernorateId(Long shippingGovernorateId);

    long countByCreatedAtBetween(Instant start, Instant end);

    @Query("select count(o) from Order o where o.createdAt between :start and :end and o.status <> 'CANCELLED'")
    long countActiveBetween(Instant start, Instant end);

    @Query("select count(o) from Order o where o.createdAt between :start and :end and o.status = 'CANCELLED'")
    long countCancelledBetween(Instant start, Instant end);

    @Query("select coalesce(sum(o.total), 0) from Order o where o.createdAt between :start and :end and o.status <> 'CANCELLED'")
    BigDecimal revenueBetween(Instant start, Instant end);

    @Query("select coalesce(sum(o.estimatedProfit), 0) from Order o where o.createdAt between :start and :end and o.status <> 'CANCELLED'")
    BigDecimal profitBetween(Instant start, Instant end);
}
