package com.sowar.store.controller;

import com.sowar.store.dto.ContactLinkRequest;
import com.sowar.store.dto.ContactLinkResponse;
import com.sowar.store.service.ContactLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
@RequestMapping("/api")
public class ContactLinkController {

    private final ContactLinkService contactLinkService;

    @GetMapping("/contact-links")
    List<ContactLinkResponse> publicLinks() {
        return contactLinkService.publicLinks();
    }

    @GetMapping("/admin/contact-links")
    List<ContactLinkResponse> adminLinks() {
        return contactLinkService.adminLinks();
    }

    @PostMapping("/admin/contact-links")
    ContactLinkResponse save(@Valid @RequestBody ContactLinkRequest request) {
        return contactLinkService.save(request);
    }

    @PutMapping("/admin/contact-links/{id}")
    ContactLinkResponse update(@PathVariable Long id, @Valid @RequestBody ContactLinkRequest request) {
        return contactLinkService.update(id, request);
    }

    @DeleteMapping("/admin/contact-links/{id}")
    void delete(@PathVariable Long id) {
        contactLinkService.delete(id);
    }
}
