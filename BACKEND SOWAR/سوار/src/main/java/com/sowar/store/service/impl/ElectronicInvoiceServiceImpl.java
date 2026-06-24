package com.sowar.store.service.impl;

import com.sowar.store.common.ApiException;
import com.sowar.store.dto.ElectronicInvoiceResponse;
import com.sowar.store.entity.ElectronicInvoice;
import com.sowar.store.entity.Order;
import com.sowar.store.entity.enums.ElectronicInvoiceStatus;
import com.sowar.store.repository.ElectronicInvoiceRepository;
import com.sowar.store.service.ElectronicInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ElectronicInvoiceServiceImpl implements ElectronicInvoiceService {

    private final ElectronicInvoiceRepository electronicInvoiceRepository;

    @Value("${app.invoice.portal.enabled:false}")
    private boolean portalEnabled;

    @Value("${app.invoice.portal.base-url:}")
    private String portalBaseUrl;

    @Value("${app.invoice.portal.client-id:}")
    private String portalClientId;

    @Value("${app.invoice.portal.client-secret:}")
    private String portalClientSecret;

    @Value("${app.invoice.taxpayer-id:}")
    private String taxpayerId;

    @Override
    @Transactional
    public ElectronicInvoiceResponse createForOrder(Order order) {
        return electronicInvoiceRepository.findByOrderId(order.getId())
                .map(this::toResponse)
                .orElseGet(() -> toResponse(electronicInvoiceRepository.save(buildInvoice(order))));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ElectronicInvoiceResponse> all() {
        return electronicInvoiceRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ElectronicInvoiceResponse byOrder(Long orderId) {
        return electronicInvoiceRepository.findByOrderId(orderId)
                .map(this::toResponse)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invoice not found"));
    }

    private ElectronicInvoice buildInvoice(Order order) {
        ElectronicInvoice invoice = new ElectronicInvoice();
        invoice.setOrder(order);
        invoice.setInvoiceNumber("SOWAR-" + order.getId());
        invoice.setSubtotal(order.getSubtotal());
        invoice.setShippingFee(order.getShippingFee());
        invoice.setTotal(order.getTotal());

        if (portalReady()) {
            invoice.setStatus(ElectronicInvoiceStatus.PENDING_SUBMISSION);
            invoice.setErrorMessage("Portal credentials are configured. Official submission adapter is waiting for portal payload details.");
        } else {
            invoice.setStatus(ElectronicInvoiceStatus.PENDING_CONFIGURATION);
            invoice.setErrorMessage("Electronic invoice portal settings are incomplete.");
        }
        return invoice;
    }

    private boolean portalReady() {
        return portalEnabled
                && hasText(portalBaseUrl)
                && hasText(portalClientId)
                && hasText(portalClientSecret)
                && hasText(taxpayerId);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private ElectronicInvoiceResponse toResponse(ElectronicInvoice invoice) {
        return new ElectronicInvoiceResponse(
                invoice.getId(),
                invoice.getOrder().getId(),
                invoice.getInvoiceNumber(),
                invoice.getSubtotal(),
                invoice.getShippingFee(),
                invoice.getTotal(),
                invoice.getStatus(),
                invoice.getPortalReference(),
                invoice.getErrorMessage(),
                invoice.getSubmittedAt(),
                invoice.getCreatedAt()
        );
    }
}
