package com.sowar.store.service.impl;




import com.sowar.store.dto.*;
import com.sowar.store.entity.*;
import com.sowar.store.repository.*;
import com.sowar.store.repository.OrderRepository;
import com.sowar.store.common.ApiException;
import com.sowar.store.mapper.ExpenseMapper;
import com.sowar.store.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.Year;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private static final ZoneId APP_ZONE = ZoneId.of("Africa/Cairo");

    private final ExpenseRepository expenseRepository;
    private final OrderRepository orderRepository;
    private final ExpenseMapper expenseMapper;


    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setTitle(request.title());
        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setExpenseDate(request.expenseDate());
        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    public List<ExpenseResponse> expenses() {
        return expenseRepository.findAll().stream().map(expenseMapper::toResponse).toList();
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = findExpense(id);
        expense.setTitle(request.title());
        expense.setDescription(request.description());
        expense.setAmount(request.amount());
        expense.setExpenseDate(request.expenseDate());
        return expenseMapper.toResponse(expense);
    }

    @Transactional
    public void deleteExpense(Long id) {
        Expense expense = findExpense(id);
        expense.setDeleted(true);
        expense.setDeletedAt(Instant.now());
        expenseRepository.save(expense);
    }

    public ReportResponse monthlyReport(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        return report(start, end, yearMonth.toString());
    }

    public ReportResponse yearlyReport(int year) {
        LocalDate start = Year.of(year).atDay(1);
        LocalDate end = Year.of(year).atMonth(12).atEndOfMonth();
        return report(start, end, String.valueOf(year));
    }

    private ReportResponse report(LocalDate start, LocalDate end, String period) {
        var startInstant = start.atStartOfDay(APP_ZONE).toInstant();
        var endInstant = end.plusDays(1).atStartOfDay(APP_ZONE).toInstant();
        long totalCount = orderRepository.countByCreatedAtBetween(startInstant, endInstant);
        long activeCount = orderRepository.countActiveBetween(startInstant, endInstant);
        long cancelledCount = orderRepository.countCancelledBetween(startInstant, endInstant);
        BigDecimal revenue = orderRepository.revenueBetween(startInstant, endInstant);
        BigDecimal grossProfit = orderRepository.profitBetween(startInstant, endInstant);
        BigDecimal expenses = expenseRepository.totalBetween(start, end);
        return new ReportResponse(period, totalCount, activeCount, cancelledCount, revenue, grossProfit, expenses, grossProfit.subtract(expenses));
    }

    private Expense findExpense(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Expense not found"));
    }
}
