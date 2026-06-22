package com.sowar.store.controller;




import com.sowar.store.dto.*;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/orders")
    CheckoutResponse createOrder(@AuthenticationPrincipal CurrentUser currentUser, @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse order = orderService.create(currentUser, request);
        return CheckoutResponse.success(order);
    }

    @PostMapping("/orders/checkout")
    CheckoutResponse checkoutCart(@AuthenticationPrincipal CurrentUser currentUser, @Valid @RequestBody CheckoutRequest request) {
        OrderResponse order = orderService.checkoutCart(currentUser, request);
        return CheckoutResponse.success(order);
    }

    @GetMapping("/orders/my")
    List<OrderResponse> myOrders(@AuthenticationPrincipal CurrentUser currentUser) {
        return orderService.myOrders(currentUser);
    }

    @GetMapping("/orders/{id}")
    OrderResponse myOrder(@AuthenticationPrincipal CurrentUser currentUser, @PathVariable Long id) {
        return orderService.myOrder(currentUser, id);
    }

    @GetMapping("/admin/orders")
    List<OrderResponse> allOrders() {
        return orderService.allOrders();
    }

    @GetMapping("/admin/orders/{id}")
    OrderResponse adminOrder(@PathVariable Long id) {
        return orderService.adminOrder(id);
    }

    @PutMapping("/admin/orders/{id}/status")
    OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request.status(), request.note());
    }
}
