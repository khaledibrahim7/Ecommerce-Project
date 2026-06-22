package com.sowar.store.mapper;

import com.sowar.store.dto.ProductResponse;
import com.sowar.store.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "hasDiscount", source = "product", qualifiedByName = "calculateHasDiscount")
    @Mapping(target = "lowStock", source = "product", qualifiedByName = "calculateLowStock")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "giftProductId", source = "giftProduct.id")
    @Mapping(target = "giftProductName", source = "giftProduct.name")
    ProductResponse toResponse(Product product);

    @Named("calculateHasDiscount")
    default boolean calculateHasDiscount(Product product) {
        BigDecimal price = product.getPrice() == null ? BigDecimal.ZERO : product.getPrice();
        BigDecimal originalPrice = product.getOriginalPrice();
        return originalPrice != null && originalPrice.compareTo(price) > 0;
    }

    @Named("calculateLowStock")
    default boolean calculateLowStock(Product product) {
        return product.getStockQuantity() <= product.getLowStockThreshold();
    }
}