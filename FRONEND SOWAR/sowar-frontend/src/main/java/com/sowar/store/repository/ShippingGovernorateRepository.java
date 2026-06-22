package com.sowar.store.repository;


import com.sowar.store.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShippingGovernorateRepository extends JpaRepository<ShippingGovernorate, Long> {

    List<ShippingGovernorate> findByActiveTrue();
}
