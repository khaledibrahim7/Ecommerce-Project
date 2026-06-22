package com.sowar.store.repository;


import com.sowar.store.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
