package com.sowar.store.service;

import com.sowar.store.dto.ContactLinkRequest;
import com.sowar.store.dto.ContactLinkResponse;

import java.util.List;

public interface ContactLinkService {

    List<ContactLinkResponse> publicLinks();

    List<ContactLinkResponse> adminLinks();

    ContactLinkResponse save(ContactLinkRequest request);

    ContactLinkResponse update(Long id, ContactLinkRequest request);

    void delete(Long id);
}
