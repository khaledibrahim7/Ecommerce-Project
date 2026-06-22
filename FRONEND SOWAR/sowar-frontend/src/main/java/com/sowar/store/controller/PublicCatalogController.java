package com.sowar.store.controller;




import com.sowar.store.dto.*;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final CatalogService catalogService;


    @GetMapping("/products/page")
    PageResponse<ProductResponse> productsPage(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "featured") String sort
    ) {
        return catalogService.searchPublicProductsPage(q, categoryId, featured, page, size, sort);
    }

    @GetMapping("/products")
    List<ProductResponse> products(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean featured
    ) {
        if (q != null || categoryId != null || featured != null) {
            return catalogService.searchPublicProducts(q, categoryId, featured);
        }
        return catalogService.listPublicProducts();
    }

    @GetMapping("/products/{id}")
    ProductResponse product(@PathVariable Long id) {
        return catalogService.getProduct(id);
    }

    @GetMapping("/categories")
    List<CategoryResponse> categories() {
        return catalogService.listCategories();
    }

    @GetMapping("/products/{id}/questions")
    List<QuestionResponse> questions(@PathVariable Long id) {
        return catalogService.listProductQuestions(id);
    }

    @PostMapping("/products/{id}/questions")
    QuestionResponse askQuestion(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request
    ) {
        return catalogService.askQuestion(currentUser.id(), id, request);
    }
}
