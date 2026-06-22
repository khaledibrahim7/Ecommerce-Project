package com.sowar.store.controller;

import com.sowar.store.dto.*;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/products/{productId}/reviews")
    List<ReviewResponse> list(@PathVariable Long productId) {
        return reviewService.listProductReviews(productId);
    }

    @PostMapping("/products/{productId}/reviews")
    ReviewResponse add(@AuthenticationPrincipal CurrentUser currentUser, @PathVariable Long productId, @Valid @RequestBody ReviewRequest request) {
        return reviewService.addReview(currentUser, productId, request);
    }

    @GetMapping("/admin/reviews")
    List<ReviewResponse> adminReviews() {
        return reviewService.listAllReviews();
    }

    @DeleteMapping("/admin/reviews/{id}")
    void delete(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }
}
