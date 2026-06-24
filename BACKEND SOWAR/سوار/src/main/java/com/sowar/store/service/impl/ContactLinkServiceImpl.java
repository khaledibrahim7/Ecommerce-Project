package com.sowar.store.service.impl;

import com.sowar.store.common.ApiException;
import com.sowar.store.dto.ContactLinkRequest;
import com.sowar.store.dto.ContactLinkResponse;
import com.sowar.store.entity.ContactLink;
import com.sowar.store.repository.ContactLinkRepository;
import com.sowar.store.service.ContactLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactLinkServiceImpl implements ContactLinkService {

    private final ContactLinkRepository contactLinkRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ContactLinkResponse> publicLinks() {
        return contactLinkRepository.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactLinkResponse> adminLinks() {
        return contactLinkRepository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ContactLinkResponse save(ContactLinkRequest request) {
        ContactLink link = new ContactLink();
        apply(link, request);
        return toResponse(contactLinkRepository.save(link));
    }

    @Override
    @Transactional
    public ContactLinkResponse update(Long id, ContactLinkRequest request) {
        ContactLink link = contactLinkRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Contact link not found"));
        apply(link, request);
        return toResponse(contactLinkRepository.save(link));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ContactLink link = contactLinkRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Contact link not found"));
        link.setDeleted(true);
        link.setDeletedAt(java.time.Instant.now());
    }

    private void apply(ContactLink link, ContactLinkRequest request) {
        link.setLabel(request.label().trim());
        link.setPlatform(request.platform().trim().toUpperCase());
        link.setValue(request.value().trim());
        link.setActive(request.active());
        link.setSortOrder(request.sortOrder());
    }

    private ContactLinkResponse toResponse(ContactLink link) {
        return new ContactLinkResponse(
                link.getId(),
                link.getLabel(),
                link.getPlatform(),
                link.getValue(),
                link.isActive(),
                link.getSortOrder()
        );
    }
}
