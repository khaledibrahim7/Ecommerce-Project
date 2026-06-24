package com.sowar.store.controller;

import com.sowar.store.dto.ElectronicInvoiceResponse;
import com.sowar.store.service.ElectronicInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/invoices")
public class ElectronicInvoiceController {

    private final ElectronicInvoiceService electronicInvoiceService;

    @GetMapping
    List<ElectronicInvoiceResponse> all() {
        return electronicInvoiceService.all();
    }

    @GetMapping("/orders/{orderId}")
    ElectronicInvoiceResponse byOrder(@PathVariable Long orderId) {
        return electronicInvoiceService.byOrder(orderId);
    }
}
