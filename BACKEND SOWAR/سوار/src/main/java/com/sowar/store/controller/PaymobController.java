package com.sowar.store.controller;

import com.sowar.store.common.ApiException;
import com.sowar.store.entity.Order;
import com.sowar.store.entity.enums.OrderStatus;
import com.sowar.store.repository.OrderRepository;
import com.sowar.store.service.PaymobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/paymob")
@RequiredArgsConstructor
public class PaymobController {

    private final PaymobService paymobService;
    private final OrderRepository orderRepository;

    public record PaymobPaymentRequest(Long orderId, String paymentMethod, String walletNumber) {}

    @PostMapping("/payment-url")
    public ResponseEntity<Map<String, String>> getPaymentUrl(@RequestBody PaymobPaymentRequest request) {
        String redirectUrl = paymobService.initiatePayment(request.orderId(), request.paymentMethod(), request.walletNumber());
        return ResponseEntity.ok(Map.of("url", redirectUrl));
    }

    @PostMapping("/callback")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Void> handleCallback(
            @RequestParam("hmac") String hmacHeader,
            @RequestBody Map<String, Object> payload
    ) {
        Map<String, Object> objData = (Map<String, Object>) payload.get("obj");
        if (objData == null) {
            return ResponseEntity.badRequest().build();
        }

        // Verify webhook signature
        if (!paymobService.verifyWebhook(objData, hmacHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean success = Boolean.parseBoolean(String.valueOf(objData.get("success")));
        if (success) {
            Map<String, Object> orderMap = (Map<String, Object>) objData.get("order");
            if (orderMap != null) {
                String merchantOrderId = String.valueOf(orderMap.get("merchant_order_id"));
                try {
                    // Merchant order id format: SOWAR-{orderId}-{timestamp}
                    String[] parts = merchantOrderId.split("-");
                    if (parts.length >= 2) {
                        Long orderId = Long.parseLong(parts[1]);
                        Order order = orderRepository.findById(orderId).orElse(null);
                        if (order != null && !order.isPaid()) {
                            order.setPaid(true);
                            order.setStatus(OrderStatus.CONFIRMED);
                            orderRepository.save(order);
                        }
                    }
                } catch (Exception e) {
                    // Log and ignore to prevent webhook retries on minor parsing issues
                }
            }
        }

        return ResponseEntity.ok().build();
    }
}
