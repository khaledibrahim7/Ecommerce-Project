package com.sowar.store.service;

import com.sowar.store.dto.*;

import java.util.List;

public interface CatalogService {

    List<ProductResponse> listPublicProducts();

    List<ProductResponse> searchPublicProducts(String q, Long categoryId, Boolean featured);

    PageResponse<ProductResponse> searchPublicProductsPage(String q, Long categoryId, Boolean featured, int page, int size, String sort);

    List<ProductResponse> listAllProducts();

    List<ProductResponse> lowStockProducts();

    ProductResponse getProduct(Long id);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    List<CategoryResponse> listCategories();

    List<QuestionResponse> listProductQuestions(Long productId);

    List<QuestionResponse> listAllQuestions();

    QuestionResponse askQuestion(Long customerId, Long productId, QuestionRequest request);

    QuestionResponse answerQuestion(Long questionId, QuestionAnswerRequest request);

    CategoryResponse createCategory(CategoryRequest request);
}

