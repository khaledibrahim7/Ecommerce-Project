package com.sowar.store.mapper;

import com.sowar.store.dto.ExpenseResponse;
import com.sowar.store.entity.Expense;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExpenseMapper {
    ExpenseResponse toResponse(Expense expense);
}