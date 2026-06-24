package com.sowar.store.repository;

import com.sowar.store.entity.ContactLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactLinkRepository extends JpaRepository<ContactLink, Long> {

    List<ContactLink> findByActiveTrueOrderBySortOrderAscIdAsc();

    List<ContactLink> findAllByOrderBySortOrderAscIdAsc();
}
