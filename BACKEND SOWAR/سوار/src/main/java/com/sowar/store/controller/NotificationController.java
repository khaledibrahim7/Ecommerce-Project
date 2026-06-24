package com.sowar.store.controller;

import com.sowar.store.dto.NotificationResponse;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    List<NotificationResponse> notifications(@AuthenticationPrincipal CurrentUser currentUser) {
        return notificationService.myNotifications(currentUser);
    }

    @GetMapping("/unread-count")
    Map<String, Long> unreadCount(@AuthenticationPrincipal CurrentUser currentUser) {
        return Map.of("count", notificationService.unreadCount(currentUser));
    }

    @PutMapping("/{id}/read")
    void markRead(@AuthenticationPrincipal CurrentUser currentUser, @PathVariable Long id) {
        notificationService.markRead(currentUser, id);
    }

    @PutMapping("/read-all")
    void markAllRead(@AuthenticationPrincipal CurrentUser currentUser) {
        notificationService.markAllRead(currentUser);
    }
}
