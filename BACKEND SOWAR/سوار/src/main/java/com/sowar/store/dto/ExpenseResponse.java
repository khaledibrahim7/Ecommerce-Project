package com.sowar.store.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(Long id, String title, String description, BigDecimal amount, LocalDate expenseDate) {}
