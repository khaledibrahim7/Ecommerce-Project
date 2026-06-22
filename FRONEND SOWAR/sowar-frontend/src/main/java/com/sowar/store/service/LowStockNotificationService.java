package com.sowar.store.service;

import com.sowar.store.entity.Product;

public interface LowStockNotificationService {
    void notifyIfLow(Product product);
}

