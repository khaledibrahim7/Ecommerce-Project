package com.sowar.store.service.impl;

import com.sowar.store.common.ApiException;
import com.sowar.store.dto.NotificationResponse;
import com.sowar.store.entity.Notification;
import com.sowar.store.entity.User;
import com.sowar.store.entity.enums.NotificationType;
import com.sowar.store.entity.enums.UserRole;
import com.sowar.store.repository.NotificationRepository;
import com.sowar.store.repository.UserRepository;
import com.sowar.store.security.CurrentUser;
import com.sowar.store.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void notifyUser(User recipient, NotificationType type, String title, String message, String targetUrl) {
        if (recipient == null || !recipient.isEnabled()) {
            return;
        }
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTargetUrl(targetUrl);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void notifyAdmins(NotificationType type, String title, String message, String targetUrl) {
        userRepository.findByRoleAndEnabledTrue(UserRole.ADMIN)
                .forEach(admin -> notifyUser(admin, type, title, message, targetUrl));
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> myNotifications(CurrentUser currentUser) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.id()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long unreadCount(CurrentUser currentUser) {
        return notificationRepository.countByRecipientIdAndReadFalse(currentUser.id());
    }

    @Override
    @Transactional
    public void markRead(CurrentUser currentUser, Long id) {
        Notification notification = notificationRepository.findById(id)
                .filter(item -> item.getRecipient().getId().equals(currentUser.id()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setRead(true);
    }

    @Override
    @Transactional
    public void markAllRead(CurrentUser currentUser) {
        notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.id())
                .forEach(notification -> notification.setRead(true));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getTargetUrl(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
