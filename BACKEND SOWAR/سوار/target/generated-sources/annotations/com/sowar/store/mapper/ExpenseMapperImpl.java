package com.sowar.store.mapper;

import com.sowar.store.dto.ExpenseResponse;
import com.sowar.store.entity.Expense;
import java.math.BigDecimal;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-24T21:42:51+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class ExpenseMapperImpl implements ExpenseMapper {

    @Override
    public ExpenseResponse toResponse(Expense expense) {
        if ( expense == null ) {
            return null;
        }

        Long id = null;
        String title = null;
        String description = null;
        BigDecimal amount = null;
        LocalDate expenseDate = null;

        id = expense.getId();
        title = expense.getTitle();
        description = expense.getDescription();
        amount = expense.getAmount();
        expenseDate = expense.getExpenseDate();

        ExpenseResponse expenseResponse = new ExpenseResponse( id, title, description, amount, expenseDate );

        return expenseResponse;
    }
}
