package com.sowar.store.entity;

import com.sowar.store.entity.enums.PromotionType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    private String weight;

    @Column(length = 2000)
    private String ingredients;

    @Column(length = 2000)
    private String usageInstructions;

    @Column(length = 2000)
    private String storageInstructions;

    private String origin;

    @Column(nullable = false)
    private boolean featured = false;

    @Column(nullable = false)
    private int sortOrder = 0;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal originalPrice;

    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PromotionType promotionType = PromotionType.NONE;

    private String promotionTitle;

    @Column(length = 1000)
    private String promotionDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gift_product_id")
    private Product giftProduct;

    private Integer giftQuantity;

    @Column(nullable = false)
    private int stockQuantity;

    @Column(nullable = false)
    private int lowStockThreshold = 5;

    @Column(nullable = false)
    private boolean lowStockAlertSent = false;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection
    private List<String> imageUrls = new ArrayList<>();
}