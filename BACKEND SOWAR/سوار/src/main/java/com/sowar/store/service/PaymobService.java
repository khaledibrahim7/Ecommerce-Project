package com.sowar.store.service;

import java.util.Map;

public interface PaymobService {
    String initiatePayment(Long orderId, String paymentMethod, String walletNumber);
    boolean verifyWebhook(Map<String, Object> hmacData, String hmacHeader);
}
