package com.sowar.store.dto;

import java.math.BigDecimal;

public record ShippingGovernorateResponse(Long id, String name, BigDecimal shippingFee, boolean active) {}
