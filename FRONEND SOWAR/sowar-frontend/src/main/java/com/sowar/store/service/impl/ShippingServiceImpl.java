package com.sowar.store.service.impl;




import com.sowar.store.dto.*;
import com.sowar.store.entity.*;
import com.sowar.store.mapper.ShippingGovernorateMapper;
import com.sowar.store.repository.*;
import com.sowar.store.common.ApiException;
import com.sowar.store.repository.OrderRepository;
import com.sowar.store.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

    private final ShippingGovernorateRepository repository;
    private final OrderRepository orderRepository;
    private final ShippingGovernorateMapper mapper;



    public List<ShippingGovernorateResponse> listPublic() {
        return repository.findByActiveTrue().stream().map(mapper::toResponse).toList();
    }

    public List<ShippingGovernorateResponse> listAll() {
        return repository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public ShippingGovernorateResponse create(ShippingGovernorateRequest request) {
        ShippingGovernorate governorate = new ShippingGovernorate();
        apply(governorate, request);
        return mapper.toResponse(repository.save(governorate));
    }

    @Transactional
    public ShippingGovernorateResponse update(Long id, ShippingGovernorateRequest request) {
        ShippingGovernorate governorate = find(id);
        apply(governorate, request);
        return mapper.toResponse(governorate);
    }

    @Transactional
    public void delete(Long id) {
        if (orderRepository.existsByShippingGovernorateId(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Shipping governorate is used by orders");
        }
        ShippingGovernorate governorate = find(id);
        governorate.setDeleted(true);
        governorate.setDeletedAt(Instant.now());
        repository.save(governorate);
    }

    public ShippingGovernorate find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Shipping governorate not found"));
    }

    private void apply(ShippingGovernorate governorate, ShippingGovernorateRequest request) {
        governorate.setName(request.name());
        governorate.setShippingFee(request.shippingFee());
        governorate.setActive(request.active());
    }
}
