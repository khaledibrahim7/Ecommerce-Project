package com.sowar.store.entity;

import com.sowar.store.entity.enums.PromotionType;
import jakarta.persistence.Column;
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

@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    private BigDecimal originalUnitPrice;

    private BigDecimal unitCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PromotionType promotionType = PromotionType.NONE;

    private String promotionTitle;

    @Column(length = 1000)
    private String promotionDescription;

    private Long giftProductId;

    private String giftProductName;

    private Integer giftQuantity;

    @Column(nullable = false)
    private BigDecimal lineTotal;
}