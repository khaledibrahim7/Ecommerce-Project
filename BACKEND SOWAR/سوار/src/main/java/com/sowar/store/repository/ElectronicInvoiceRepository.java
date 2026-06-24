package com.sowar.store.repository;

import com.sowar.store.entity.ElectronicInvoice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ElectronicInvoiceRepository extends JpaRepository<ElectronicInvoice, Long> {

    @EntityGraph(attributePaths = {"order"})
    Optional<ElectronicInvoice> findByOrderId(Long orderId);

    @Override
    @EntityGraph(attributePaths = {"order"})
    List<ElectronicInvoice> findAll();
}
