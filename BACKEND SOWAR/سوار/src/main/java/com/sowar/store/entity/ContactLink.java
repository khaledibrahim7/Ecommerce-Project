package com.sowar.store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "contact_links")
public class ContactLink extends BaseEntity {

    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private String platform;

    @Column(nullable = false, length = 1000)
    private String value;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private int sortOrder = 0;
}
