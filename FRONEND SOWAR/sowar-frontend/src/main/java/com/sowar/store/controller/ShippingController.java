package com.sowar.store.controller;




import com.sowar.store.dto.*;
import com.sowar.store.service.ShippingService;
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
@RequestMapping("/api")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @GetMapping("/shipping-governorates")
    List<ShippingGovernorateResponse> publicGovernorates() {
        return shippingService.listPublic();
    }

    @GetMapping("/admin/shipping-governorates")
    List<ShippingGovernorateResponse> allGovernorates() {
        return shippingService.listAll();
    }

    @PostMapping("/admin/shipping-governorates")
    ShippingGovernorateResponse create(@Valid @RequestBody ShippingGovernorateRequest request) {
        return shippingService.create(request);
    }

    @PutMapping("/admin/shipping-governorates/{id}")
    ShippingGovernorateResponse update(@PathVariable Long id, @Valid @RequestBody ShippingGovernorateRequest request) {
        return shippingService.update(id, request);
    }

    @DeleteMapping("/admin/shipping-governorates/{id}")
    void delete(@PathVariable Long id) {
        shippingService.delete(id);
    }
}
