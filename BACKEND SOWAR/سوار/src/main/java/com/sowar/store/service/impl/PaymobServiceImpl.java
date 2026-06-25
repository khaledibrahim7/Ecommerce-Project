package com.sowar.store.service.impl;

import com.sowar.store.common.ApiException;
import com.sowar.store.entity.Order;
import com.sowar.store.repository.OrderRepository;
import com.sowar.store.service.PaymobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymobServiceImpl implements PaymobService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${paymob.api-key:}")
    private String apiKey;

    @Value("${paymob.iframe-id:}")
    private String iframeId;

    @Value("${paymob.card-integration-id:}")
    private String cardIntegrationId;

    @Value("${paymob.wallet-integration-id:}")
    private String walletIntegrationId;

    @Value("${paymob.hmac-secret:}")
    private String hmacSecret;

    @Override
    @Transactional(readOnly = true)
    public String initiatePayment(Long orderId, String paymentMethod, String walletNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        log.info("Paymob initiation started for Order ID: {}, Method: {}, Wallet: {}", orderId, paymentMethod, walletNumber);
        log.info("Loaded configuration - Card Integration: {}, Wallet Integration: {}, API Key prefix: {}", 
                cardIntegrationId, walletIntegrationId, 
                (apiKey != null && apiKey.length() > 10) ? apiKey.substring(0, 10) + "..." : "EMPTY");

        // Step 1: Authentication
        String authToken = authenticate();

        // Step 2: Order Registration
        String paymobOrderId = registerOrder(authToken, order);

        // Step 3: Payment Key Generation
        String integrationId = "VISA".equalsIgnoreCase(paymentMethod) ? cardIntegrationId : walletIntegrationId;
        String paymentKeyToken = getPaymentKeyToken(authToken, paymobOrderId, order, integrationId);

        // Step 4: Redirection URL
        if ("VISA".equalsIgnoreCase(paymentMethod)) {
            return "https://accept.paymob.com/api/acceptance/iframes/" + iframeId + "?payment_token=" + paymentKeyToken;
        } else if ("WALLET".equalsIgnoreCase(paymentMethod)) {
            return getWalletPaymentUrl(paymentKeyToken, walletNumber);
        }

        throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported payment method");
    }

    private String authenticate() {
        String url = "https://accept.paymob.com/api/auth/tokens";
        Map<String, String> body = new HashMap<>();
        body.put("api_key", apiKey);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);
            if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                return (String) response.getBody().get("token");
            }
        } catch (HttpStatusCodeException e) {
            log.error("Paymob authenticate error body: {}", e.getResponseBodyAsString());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to authenticate with Paymob: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to authenticate with Paymob: " + e.getMessage());
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Authentication with Paymob failed");
    }

    private String registerOrder(String authToken, Order order) {
        String url = "https://accept.paymob.com/api/ecommerce/orders";
        
        Map<String, Object> body = new HashMap<>();
        body.put("auth_token", authToken);
        body.put("delivery_needed", false);
        // Paymob expects amount in cents
        int amountCents = order.getTotal().multiply(new BigDecimal(100)).intValue();
        body.put("amount_cents", amountCents);
        body.put("currency", "EGP");
        body.put("merchant_order_id", "SOWAR-" + order.getId() + "-" + System.currentTimeMillis());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + authToken);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                return String.valueOf(response.getBody().get("id"));
            }
        } catch (HttpStatusCodeException e) {
            log.error("Paymob registerOrder error body: {}", e.getResponseBodyAsString());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to register order with Paymob: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to register order with Paymob: " + e.getMessage());
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Order registration with Paymob failed");
    }

    private String getPaymentKeyToken(String authToken, String paymobOrderId, Order order, String integrationId) {
        String url = "https://accept.paymob.com/api/acceptance/payment_keys";

        Map<String, Object> body = new HashMap<>();
        body.put("auth_token", authToken);
        int amountCents = order.getTotal().multiply(new BigDecimal(100)).intValue();
        body.put("amount_cents", amountCents);
        body.put("expiration", 3600);
        body.put("order_id", Long.parseLong(paymobOrderId));
        body.put("currency", "EGP");
        body.put("integration_id", Integer.parseInt(integrationId));

        Map<String, String> billingData = new HashMap<>();
        String name = order.getCustomerName() != null ? order.getCustomerName() : "Sowar Customer";
        String[] nameParts = name.split(" ", 2);
        billingData.put("first_name", nameParts[0]);
        billingData.put("last_name", nameParts.length > 1 ? nameParts[1] : "Sowar");
        billingData.put("email", order.getCustomer().getEmail() != null ? order.getCustomer().getEmail() : "no-email@sowar.com");
        billingData.put("phone_number", order.getCustomerPhone() != null ? order.getCustomerPhone() : "01000000000");
        billingData.put("apartment", "NA");
        billingData.put("floor", "NA");
        billingData.put("building", "NA");
        billingData.put("street", order.getAddressDetails().getStreet() != null ? order.getAddressDetails().getStreet() : "NA");
        billingData.put("postal_code", "NA");
        billingData.put("city", order.getShippingGovernorate().getName());
        billingData.put("country", "EG");
        billingData.put("state", "Egypt");

        body.put("billing_data", billingData);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + authToken);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                return (String) response.getBody().get("token");
            }
        } catch (HttpStatusCodeException e) {
            log.error("Paymob getPaymentKeyToken error body: {}", e.getResponseBodyAsString());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch payment key from Paymob: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to fetch payment key from Paymob: " + e.getMessage());
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Fetching payment key token failed");
    }

    private String getWalletPaymentUrl(String paymentKeyToken, String walletNumber) {
        String url = "https://accept.paymob.com/api/acceptance/payments/pay";

        Map<String, Object> body = new HashMap<>();
        body.put("payment_token", paymentKeyToken);

        Map<String, String> source = new HashMap<>();
        source.put("identifier", walletNumber);
        source.put("subtype", "WALLET");
        body.put("source", source);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody.containsKey("redirect_url")) {
                    return (String) responseBody.get("redirect_url");
                } else if (responseBody.containsKey("iframe_redirection_url")) {
                    return (String) responseBody.get("iframe_redirection_url");
                }
            }
        } catch (HttpStatusCodeException e) {
            log.error("Paymob getWalletPaymentUrl error body: {}", e.getResponseBodyAsString());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get mobile wallet redirect URL from Paymob: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get mobile wallet redirect URL from Paymob: " + e.getMessage());
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Mobile wallet payment initiation failed");
    }

    @Override
    @SuppressWarnings("unchecked")
    public boolean verifyWebhook(Map<String, Object> hmacData, String hmacHeader) {
        try {
            String amountCents = String.valueOf(hmacData.get("amount_cents"));
            String createdAt = String.valueOf(hmacData.get("created_at"));
            String currency = String.valueOf(hmacData.get("currency"));
            String errorOccured = String.valueOf(hmacData.get("error_occured"));
            String hasParentTransaction = String.valueOf(hmacData.get("has_parent_transaction"));
            String id = String.valueOf(hmacData.get("id"));
            String integrationId = String.valueOf(hmacData.get("integration_id"));
            String is3dSecure = String.valueOf(hmacData.get("is_3d_secure"));
            String isAuth = String.valueOf(hmacData.get("is_auth"));
            String isCapture = String.valueOf(hmacData.get("is_capture"));
            String isRefunded = String.valueOf(hmacData.get("is_refunded"));
            String isStandalonePayment = String.valueOf(hmacData.get("is_standalone_payment"));
            String isVoided = String.valueOf(hmacData.get("is_voided"));

            Map<String, Object> orderMap = (Map<String, Object>) hmacData.get("order");
            String orderId = orderMap != null ? String.valueOf(orderMap.get("id")) : "";

            String owner = String.valueOf(hmacData.get("owner"));
            String pending = String.valueOf(hmacData.get("pending"));

            Map<String, Object> sourceData = (Map<String, Object>) hmacData.get("source_data");
            String pan = sourceData != null ? String.valueOf(sourceData.get("pan")) : "";
            String subType = sourceData != null ? String.valueOf(sourceData.get("sub_type")) : "";
            String type = sourceData != null ? String.valueOf(sourceData.get("type")) : "";

            String success = String.valueOf(hmacData.get("success"));

            String concatenated = amountCents + createdAt + currency + errorOccured + hasParentTransaction + id +
                    integrationId + is3dSecure + isAuth + isCapture + isRefunded + isStandalonePayment +
                    isVoided + orderId + owner + pending + pan + subType + type + success;

            String calculatedHmac = hmacSha512(concatenated, hmacSecret);
            return calculatedHmac.equalsIgnoreCase(hmacHeader);
        } catch (Exception e) {
            return false;
        }
    }

    private String hmacSha512(String data, String key) {
        try {
            javax.crypto.Mac sha512Hmac = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512Hmac.init(secretKey);
            byte[] macData = sha512Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte b : macData) {
                result.append(String.format("%02x", b));
            }
            return result.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC-SHA512", e);
        }
    }
}
