package com.sowar.store.service;

import com.sowar.store.dto.ElectronicInvoiceResponse;
import com.sowar.store.entity.Order;

import java.util.List;

public interface ElectronicInvoiceService {

    ElectronicInvoiceResponse createForOrder(Order order);

    List<ElectronicInvoiceResponse> all();

    ElectronicInvoiceResponse byOrder(Long orderId);
}
