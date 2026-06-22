package com.sowar.store.repository;


import com.sowar.store.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("select coalesce(sum(e.amount), 0) from Expense e where e.expenseDate between :start and :end")
    BigDecimal totalBetween(LocalDate start, LocalDate end);
}
