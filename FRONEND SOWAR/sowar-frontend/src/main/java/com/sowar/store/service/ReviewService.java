package com.sowar.store.service;

import com.sowar.store.dto.*;
import com.sowar.store.security.CurrentUser;

import java.util.List;

public interface ReviewService {
    List<ReviewResponse> listProductReviews(Long productId);

    List<ReviewResponse> listAllReviews();

    ReviewResponse addReview(CurrentUser currentUser, Long productId, ReviewRequest request);

    void deleteReview(Long id);
}

