package com.sowar.store.service;

import com.sowar.store.dto.*;

import java.util.List;

public interface FinanceService {

    ExpenseResponse createExpense(ExpenseRequest request);

    List<ExpenseResponse> expenses();

    ExpenseResponse updateExpense(Long id, ExpenseRequest request);

    void deleteExpense(Long id);

    ReportResponse monthlyReport(int year, int month);

    ReportResponse yearlyReport(int year);
}

