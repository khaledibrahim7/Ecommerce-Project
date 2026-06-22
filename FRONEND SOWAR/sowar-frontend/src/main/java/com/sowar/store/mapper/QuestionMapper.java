package com.sowar.store.mapper;

import com.sowar.store.dto.QuestionResponse;
import com.sowar.store.entity.ProductQuestion;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    default QuestionResponse toResponse(ProductQuestion question) {
        Long productId = question.getProduct() == null ? null : question.getProduct().getId();
        String productName = question.getProduct() == null ? "منتج غير متاح" : question.getProduct().getName();
        String customerName = question.getCustomer() == null ? "عميل سوار" : question.getCustomer().getFullName();
        return new QuestionResponse(
                question.getId(),
                productId,
                productName,
                customerName,
                question.getQuestion(),
                question.getAnswer(),
                question.isAnswered(),
                question.getCreatedAt()
        );
    }
}
