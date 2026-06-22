package com.sowar.store.common;

import org.springframework.http.HttpStatus;

public class InsufficientStockException extends ApiException {

    public InsufficientStockException(String message) {
        super(HttpStatus.BAD_REQUEST, ErrorCode.INSUFFICIENT_STOCK, message);
    }
}
