package com.sowar.store.service;

import com.sowar.store.dto.NotificationResponse;
import com.sowar.store.entity.User;
import com.sowar.store.entity.enums.NotificationType;
import com.sowar.store.security.CurrentUser;

import java.util.List;

public interface NotificationService {

    void notifyUser(User recipient, NotificationType type, String title, String message, String targetUrl);

    void notifyAdmins(NotificationType type, String title, String message, String targetUrl);

    List<NotificationResponse> myNotifications(CurrentUser currentUser);

    long unreadCount(CurrentUser currentUser);

    void markRead(CurrentUser currentUser, Long id);

    void markAllRead(CurrentUser currentUser);
}
