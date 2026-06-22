package com.sowar.store.mapper;

import com.sowar.store.dto.ReviewResponse;
import com.sowar.store.entity.ProductReview;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    default ReviewResponse toResponse(ProductReview review) {
        Long productId = review.getProduct() == null ? null : review.getProduct().getId();
        String productName = review.getProduct() == null ? "منتج غير متاح" : review.getProduct().getName();
        String customerName = review.getCustomer() == null ? "عميل سوار" : review.getCustomer().getFullName();
        return new ReviewResponse(
                review.getId(),
                productId,
                productName,
                customerName,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
