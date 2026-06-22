package com.sowar.store.dto;


import java.math.BigDecimal;

public record ReportResponse(
        String period,
        long totalOrdersCount,
        long activeOrdersCount,
        long cancelledOrdersCount,
        BigDecimal revenue,
        BigDecimal grossProfit,
        BigDecimal expenses,
        BigDecimal netProfit
) {
}
