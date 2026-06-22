package com.sowar.store.service.impl;




import com.sowar.store.dto.*;
import com.sowar.store.entity.*;
import com.sowar.store.entity.enums.OrderStatus;
import com.sowar.store.repository.*;
import com.sowar.store.common.ApiException;
import com.sowar.store.common.InsufficientStockException;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.service.OrderService;
import com.sowar.store.service.ShippingService;
import com.sowar.store.service.LowStockNotificationService;
import com.sowar.store.service.UserService;
import com.sowar.store.service.promotion.PromotionStrategyFactory;
import com.sowar.store.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ShippingService shippingService;
    private final UserService userService;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final CartItemRepository cartItemRepository;
    private final LowStockNotificationService lowStockNotificationService;
    private final PromotionStrategyFactory promotionStrategyFactory;
    private final OrderMapper orderMapper;



    @Transactional
    public OrderResponse create(CurrentUser currentUser, CreateOrderRequest request) {
        User customer = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        ShippingGovernorate governorate = request.deliveryAddress() == null
                ? customer.getDefaultGovernorate()
                : shippingService.find(request.deliveryAddress().governorateId());
        if (governorate == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Customer address is required");
        }
        AddressDetails addressDetails = request.deliveryAddress() == null
                ? customer.getDefaultAddress()
                : userService.toAddressDetails(request.deliveryAddress());

        Order order = new Order();
        order.setCustomer(customer);
        order.setCustomerName(customer.getFullName());
        order.setCustomerPhone(customer.getPhone());
        order.setAddressDetails(addressDetails);
        order.setAddress(addressDetails.toSingleLine(governorate.getName()));
        order.setShippingGovernorate(governorate);
        order.setShippingFee(governorate.getShippingFee());
        order.setNotes(request.notes());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal estimatedProfit = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
            if (!product.isActive()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Product is not active");
            }
            if (product.getStockQuantity() < itemRequest.quantity()) {
                throw new InsufficientStockException("Not enough stock for " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - itemRequest.quantity());
            lowStockNotificationService.notifyIfLow(product);
            
            // استخدام الـ Strategy لمعالجة العروض الخاصة (مثل خصم مخزون الهدية)
            promotionStrategyFactory.getStrategy(product.getPromotionType())
                    .applyOnOrderCreation(product, itemRequest.quantity(), lowStockNotificationService);

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            BigDecimal cost = product.getCost() == null ? BigDecimal.ZERO : product.getCost();

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setQuantity(itemRequest.quantity());
            item.setUnitPrice(product.getPrice());
            item.setOriginalUnitPrice(product.getOriginalPrice());
            item.setUnitCost(cost);
            item.setPromotionType(product.getPromotionType());
            item.setPromotionTitle(product.getPromotionTitle());
            item.setPromotionDescription(product.getPromotionDescription());
            item.setGiftProductId(product.getGiftProduct() == null ? null : product.getGiftProduct().getId());
            item.setGiftProductName(product.getGiftProduct() == null ? null : product.getGiftProduct().getName());
            item.setGiftQuantity(product.getGiftQuantity());
            item.setLineTotal(lineTotal);
            order.getItems().add(item);

            subtotal = subtotal.add(lineTotal);
            estimatedProfit = estimatedProfit.add(product.getPrice().subtract(cost).multiply(BigDecimal.valueOf(itemRequest.quantity())));
        }

        order.setSubtotal(subtotal);
        order.setTotal(subtotal.add(order.getShippingFee()));
        order.setEstimatedProfit(estimatedProfit);
        Order savedOrder = orderRepository.save(order);
        addStatusHistory(savedOrder, OrderStatus.PLACED, "تم قبول طلبك بنجاح. سيتم التواصل بك لتوصيل الأوردر خلال أيام.");
        return orderMapper.toResponse(savedOrder, orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(savedOrder.getId()));
    }

    @Transactional
    public OrderResponse checkoutCart(CurrentUser currentUser, CheckoutRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(currentUser.id());
        if (cartItems.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }
        CreateOrderRequest orderRequest = new CreateOrderRequest(
                request.deliveryAddress(),
                request.notes(),
                cartItems.stream()
                        .map(item -> new CreateOrderRequest.OrderItemRequest(item.getProduct().getId(), item.getQuantity()))
                        .toList()
        );
        OrderResponse response = create(currentUser, orderRequest);
        List<CartItem> toDelete = cartItemRepository.findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(currentUser.id());
        toDelete.forEach(item -> {
            item.setDeleted(true);
            item.setDeletedAt(java.time.Instant.now());
        });
        cartItemRepository.saveAll(toDelete);
        return response;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(CurrentUser currentUser) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(currentUser.id()).stream().map(orderMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> allOrders() {
        return orderRepository.findAll().stream().map(orderMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse myOrder(CurrentUser currentUser, Long id) {
        return orderRepository.findByIdAndCustomerId(id, currentUser.id())
                .map(order -> orderMapper.toResponse(order, orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional(readOnly = true)
    public OrderResponse adminOrder(Long id) {
        return orderRepository.findById(id)
                .map(order -> orderMapper.toResponse(order, orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status, String note) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        OrderStatus previousStatus = order.getStatus();
        if (status == OrderStatus.CANCELLED && previousStatus != OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        order.setStatus(status);
        addStatusHistory(order, status, note == null || note.isBlank() ? "Order status changed to " + status.name() : note);
        return orderMapper.toResponse(order, orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(order.getId()));
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            lowStockNotificationService.notifyIfLow(product);
            
            // استخدام الـ Strategy لاسترجاع مخزون العروض (مثل الهدايا)
            promotionStrategyFactory.getStrategy(item.getPromotionType())
                    .restoreStockOnCancel(item, productRepository, lowStockNotificationService);
        }
    }

    private void addStatusHistory(Order order, OrderStatus status, String note) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        history.setNote(note);
        orderStatusHistoryRepository.save(history);
    }
}
