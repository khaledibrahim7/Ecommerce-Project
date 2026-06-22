package com.sowar.store.service.promotion;

import com.sowar.store.entity.enums.PromotionType;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PromotionStrategyFactory {
    
    private final List<PromotionStrategy> strategies;

    public PromotionStrategyFactory(List<PromotionStrategy> strategies) {
        this.strategies = strategies;
    }

    public PromotionStrategy getStrategy(PromotionType type) {
        return strategies.stream()
                .filter(s -> s.supports(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No promotion strategy found for type: " + type));
    }
}
