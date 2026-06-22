package com.sowar.store.mapper;

import com.sowar.store.dto.OrderResponse;
import com.sowar.store.entity.AddressDetails;
import com.sowar.store.entity.Order;
import com.sowar.store.entity.OrderItem;
import com.sowar.store.entity.OrderStatusHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "governorate", source = "order.shippingGovernorate.name")
    @Mapping(target = "statusHistory", source = "history")
    OrderResponse toResponse(Order order, List<OrderStatusHistory> history);

    default OrderResponse toResponse(Order order) {
        return toResponse(order, List.of());
    }

    @Mapping(target = "hasDiscount", source = "item", qualifiedByName = "itemHasDiscount")
    @Mapping(target = "productId", source = "product.id")
    OrderResponse.Item toItemResponse(OrderItem item);

    OrderResponse.AddressDetailsResponse toAddressDetailsResponse(AddressDetails details);

    OrderResponse.StatusHistory toStatusHistoryResponse(OrderStatusHistory history);

    @Named("itemHasDiscount")
    default boolean itemHasDiscount(OrderItem item) {
        BigDecimal price = item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice();
        BigDecimal originalPrice = item.getOriginalUnitPrice();
        return originalPrice != null && originalPrice.compareTo(price) > 0;
    }
}