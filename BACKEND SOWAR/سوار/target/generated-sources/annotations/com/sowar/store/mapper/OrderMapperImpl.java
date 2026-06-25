package com.sowar.store.mapper;

import com.sowar.store.dto.OrderResponse;
import com.sowar.store.entity.AddressDetails;
import com.sowar.store.entity.Order;
import com.sowar.store.entity.OrderItem;
import com.sowar.store.entity.OrderStatusHistory;
import com.sowar.store.entity.Product;
import com.sowar.store.entity.ShippingGovernorate;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-25T02:59:23+0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.12 (Oracle Corporation)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public OrderResponse toResponse(Order order, List<OrderStatusHistory> history) {
        if ( order == null && history == null ) {
            return null;
        }

        OrderResponse.OrderResponseBuilder orderResponse = OrderResponse.builder();

        if ( order != null ) {
            orderResponse.governorate( orderShippingGovernorateName( order ) );
            orderResponse.id( order.getId() );
            orderResponse.createdAt( order.getCreatedAt() );
            orderResponse.customerName( order.getCustomerName() );
            orderResponse.customerPhone( order.getCustomerPhone() );
            orderResponse.address( order.getAddress() );
            orderResponse.addressDetails( toAddressDetailsResponse( order.getAddressDetails() ) );
            orderResponse.status( order.getStatus() );
            orderResponse.subtotal( order.getSubtotal() );
            orderResponse.shippingFee( order.getShippingFee() );
            orderResponse.total( order.getTotal() );
            orderResponse.estimatedProfit( order.getEstimatedProfit() );
            orderResponse.notes( order.getNotes() );
            orderResponse.paymentMethod( order.getPaymentMethod() );
            orderResponse.paid( order.isPaid() );
            orderResponse.items( orderItemListToItemList( order.getItems() ) );
        }
        orderResponse.statusHistory( orderStatusHistoryListToStatusHistoryList( history ) );

        return orderResponse.build();
    }

    @Override
    public OrderResponse.Item toItemResponse(OrderItem item) {
        if ( item == null ) {
            return null;
        }

        OrderResponse.Item.ItemBuilder item1 = OrderResponse.Item.builder();

        item1.hasDiscount( itemHasDiscount( item ) );
        item1.productId( itemProductId( item ) );
        item1.productName( item.getProductName() );
        item1.quantity( item.getQuantity() );
        item1.unitPrice( item.getUnitPrice() );
        item1.originalUnitPrice( item.getOriginalUnitPrice() );
        item1.promotionType( item.getPromotionType() );
        item1.promotionTitle( item.getPromotionTitle() );
        item1.promotionDescription( item.getPromotionDescription() );
        item1.giftProductId( item.getGiftProductId() );
        item1.giftProductName( item.getGiftProductName() );
        item1.giftQuantity( item.getGiftQuantity() );
        item1.lineTotal( item.getLineTotal() );

        return item1.build();
    }

    @Override
    public OrderResponse.AddressDetailsResponse toAddressDetailsResponse(AddressDetails details) {
        if ( details == null ) {
            return null;
        }

        OrderResponse.AddressDetailsResponse.AddressDetailsResponseBuilder addressDetailsResponse = OrderResponse.AddressDetailsResponse.builder();

        addressDetailsResponse.city( details.getCity() );
        addressDetailsResponse.area( details.getArea() );
        addressDetailsResponse.street( details.getStreet() );
        addressDetailsResponse.buildingNumber( details.getBuildingNumber() );
        addressDetailsResponse.floor( details.getFloor() );
        addressDetailsResponse.apartment( details.getApartment() );
        addressDetailsResponse.landmark( details.getLandmark() );
        addressDetailsResponse.addressType( details.getAddressType() );
        addressDetailsResponse.deliveryNotes( details.getDeliveryNotes() );

        return addressDetailsResponse.build();
    }

    @Override
    public OrderResponse.StatusHistory toStatusHistoryResponse(OrderStatusHistory history) {
        if ( history == null ) {
            return null;
        }

        OrderResponse.StatusHistory.StatusHistoryBuilder statusHistory = OrderResponse.StatusHistory.builder();

        statusHistory.status( history.getStatus() );
        statusHistory.note( history.getNote() );
        statusHistory.createdAt( history.getCreatedAt() );

        return statusHistory.build();
    }

    private String orderShippingGovernorateName(Order order) {
        if ( order == null ) {
            return null;
        }
        ShippingGovernorate shippingGovernorate = order.getShippingGovernorate();
        if ( shippingGovernorate == null ) {
            return null;
        }
        String name = shippingGovernorate.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    protected List<OrderResponse.StatusHistory> orderStatusHistoryListToStatusHistoryList(List<OrderStatusHistory> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderResponse.StatusHistory> list1 = new ArrayList<OrderResponse.StatusHistory>( list.size() );
        for ( OrderStatusHistory orderStatusHistory : list ) {
            list1.add( toStatusHistoryResponse( orderStatusHistory ) );
        }

        return list1;
    }

    protected List<OrderResponse.Item> orderItemListToItemList(List<OrderItem> list) {
        if ( list == null ) {
            return null;
        }

        List<OrderResponse.Item> list1 = new ArrayList<OrderResponse.Item>( list.size() );
        for ( OrderItem orderItem : list ) {
            list1.add( toItemResponse( orderItem ) );
        }

        return list1;
    }

    private Long itemProductId(OrderItem orderItem) {
        if ( orderItem == null ) {
            return null;
        }
        Product product = orderItem.getProduct();
        if ( product == null ) {
            return null;
        }
        Long id = product.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
