package com.sowar.store.controller;




import com.sowar.store.dto.*;
import com.sowar.store.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/finance")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @PostMapping("/expenses")
    ExpenseResponse createExpense(@Valid @RequestBody ExpenseRequest request) {
        return financeService.createExpense(request);
    }

    @GetMapping("/expenses")
    List<ExpenseResponse> expenses() {
        return financeService.expenses();
    }

    @PutMapping("/expenses/{id}")
    ExpenseResponse updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseRequest request) {
        return financeService.updateExpense(id, request);
    }

    @DeleteMapping("/expenses/{id}")
    void deleteExpense(@PathVariable Long id) {
        financeService.deleteExpense(id);
    }

    @GetMapping("/reports/monthly/{year}/{month}")
    ReportResponse monthly(@PathVariable int year, @PathVariable int month) {
        return financeService.monthlyReport(year, month);
    }

    @GetMapping("/reports/yearly/{year}")
    ReportResponse yearly(@PathVariable int year) {
        return financeService.yearlyReport(year);
    }
}
