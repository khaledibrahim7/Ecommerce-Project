package com.sowar.store.service.impl;

import com.sowar.store.common.ApiException;
import com.sowar.store.dto.*;
import com.sowar.store.entity.*;
import com.sowar.store.mapper.ReviewMapper;
import com.sowar.store.repository.*;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;



    @Transactional(readOnly = true)
    public List<ReviewResponse> listProductReviews(Long productId) {
        return productReviewRepository.findByProductIdAndApprovedTrueAndDeletedFalseOrderByCreatedAtDesc(productId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listAllReviews() {
        return productReviewRepository.findByDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse addReview(CurrentUser currentUser, Long productId, ReviewRequest request) {
        User customer = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        ProductReview review = new ProductReview();
        review.setCustomer(customer);
        review.setProduct(product);
        review.setRating(request.rating());
        review.setComment(request.comment());
        return reviewMapper.toResponse(productReviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long id) {
        ProductReview review = productReviewRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));
        review.setDeleted(true);
        review.setDeletedAt(Instant.now());
        productReviewRepository.save(review);
    }
}
