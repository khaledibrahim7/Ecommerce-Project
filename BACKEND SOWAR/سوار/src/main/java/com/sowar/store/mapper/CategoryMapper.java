package com.sowar.store.mapper;

import com.sowar.store.dto.CategoryResponse;
import com.sowar.store.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
}