package com.sowar.store.service;

import com.sowar.store.dto.*;
import com.sowar.store.entity.enums.OrderStatus;
import com.sowar.store.security.CurrentUser;

import java.util.List;

public interface OrderService {

    OrderResponse create(CurrentUser currentUser, CreateOrderRequest request);

    OrderResponse checkoutCart(CurrentUser currentUser, CheckoutRequest request);

    List<OrderResponse> myOrders(CurrentUser currentUser);

    List<OrderResponse> allOrders();

    OrderResponse myOrder(CurrentUser currentUser, Long id);

    OrderResponse adminOrder(Long id);

    OrderResponse updateStatus(Long id, OrderStatus status, String note);
}

