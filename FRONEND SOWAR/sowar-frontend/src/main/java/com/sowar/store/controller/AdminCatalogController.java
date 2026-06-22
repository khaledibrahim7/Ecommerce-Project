package com.sowar.store.controller;





import com.sowar.store.dto.*;
import com.sowar.store.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCatalogController {

    private final CatalogService catalogService;


    @GetMapping("/products")
    List<ProductResponse> products() {
        return catalogService.listAllProducts();
    }

    @GetMapping("/products/low-stock")
    List<ProductResponse> lowStockProducts() {
        return catalogService.lowStockProducts();
    }

    @PostMapping("/products")
    ProductResponse createProduct(@Valid @RequestBody ProductRequest request) {
        return catalogService.createProduct(request);
    }

    @PutMapping("/products/{id}")
    ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return catalogService.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    void deleteProduct(@PathVariable Long id) {
        catalogService.deleteProduct(id);
    }

    @PostMapping("/categories")
    CategoryResponse createCategory(@Valid @RequestBody CategoryRequest request) {
        return catalogService.createCategory(request);
    }

    @PutMapping("/categories/{id}")
    CategoryResponse updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return catalogService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    void deleteCategory(@PathVariable Long id) {
        catalogService.deleteCategory(id);
    }

    @GetMapping("/questions")
    List<QuestionResponse> questions() {
        return catalogService.listAllQuestions();
    }

    @PutMapping("/questions/{id}/answer")
    QuestionResponse answerQuestion(@PathVariable Long id, @Valid @RequestBody QuestionAnswerRequest request) {
        return catalogService.answerQuestion(id, request);
    }
}
