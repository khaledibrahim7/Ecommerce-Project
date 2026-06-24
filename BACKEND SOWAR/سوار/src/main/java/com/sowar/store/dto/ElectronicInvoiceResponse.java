package com.sowar.store.dto;

import com.sowar.store.entity.enums.ElectronicInvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record ElectronicInvoiceResponse(
        Long id,
        Long orderId,
        String invoiceNumber,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        ElectronicInvoiceStatus status,
        String portalReference,
        String errorMessage,
        Instant submittedAt,
        Instant createdAt
) {}
