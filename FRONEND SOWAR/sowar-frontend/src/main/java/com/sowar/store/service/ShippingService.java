package com.sowar.store.service;

import com.sowar.store.dto.*;

import java.util.List;

public interface ShippingService {
    List<ShippingGovernorateResponse> listPublic();

    List<ShippingGovernorateResponse> listAll();

    ShippingGovernorateResponse create(ShippingGovernorateRequest request);

    ShippingGovernorateResponse update(Long id, ShippingGovernorateRequest request);

    void delete(Long id);

    com.sowar.store.entity.ShippingGovernorate find(Long id);
}

