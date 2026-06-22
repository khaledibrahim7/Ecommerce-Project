package com.sowar.store.mapper;

import com.sowar.store.dto.ProductResponse;
import com.sowar.store.entity.Category;
import com.sowar.store.entity.Product;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-20T21:03:08+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public ProductResponse toResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductResponse.ProductResponseBuilder productResponse = ProductResponse.builder();

        productResponse.hasDiscount( calculateHasDiscount( product ) );
        productResponse.lowStock( calculateLowStock( product ) );
        productResponse.categoryId( productCategoryId( product ) );
        productResponse.categoryName( productCategoryName( product ) );
        productResponse.giftProductId( productGiftProductId( product ) );
        productResponse.giftProductName( productGiftProductName( product ) );
        productResponse.id( product.getId() );
        productResponse.name( product.getName() );
        productResponse.description( product.getDescription() );
        productResponse.weight( product.getWeight() );
        productResponse.ingredients( product.getIngredients() );
        productResponse.usageInstructions( product.getUsageInstructions() );
        productResponse.storageInstructions( product.getStorageInstructions() );
        productResponse.origin( product.getOrigin() );
        productResponse.featured( product.isFeatured() );
        productResponse.sortOrder( product.getSortOrder() );
        productResponse.price( product.getPrice() );
        productResponse.originalPrice( product.getOriginalPrice() );
        productResponse.cost( product.getCost() );
        productResponse.promotionType( product.getPromotionType() );
        productResponse.promotionTitle( product.getPromotionTitle() );
        productResponse.promotionDescription( product.getPromotionDescription() );
        productResponse.giftQuantity( product.getGiftQuantity() );
        productResponse.stockQuantity( product.getStockQuantity() );
        productResponse.lowStockThreshold( product.getLowStockThreshold() );
        productResponse.lowStockAlertSent( product.isLowStockAlertSent() );
        productResponse.active( product.isActive() );
        List<String> list = product.getImageUrls();
        if ( list != null ) {
            productResponse.imageUrls( new ArrayList<String>( list ) );
        }

        return productResponse.build();
    }

    private Long productCategoryId(Product product) {
        if ( product == null ) {
            return null;
        }
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        Long id = category.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String productCategoryName(Product product) {
        if ( product == null ) {
            return null;
        }
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        String name = category.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private Long productGiftProductId(Product product) {
        if ( product == null ) {
            return null;
        }
        Product giftProduct = product.getGiftProduct();
        if ( giftProduct == null ) {
            return null;
        }
        Long id = giftProduct.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String productGiftProductName(Product product) {
        if ( product == null ) {
            return null;
        }
        Product giftProduct = product.getGiftProduct();
        if ( giftProduct == null ) {
            return null;
        }
        String name = giftProduct.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }
}
