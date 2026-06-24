package com.sowar.store.service;

public interface AppEmailService {

    void send(String to, String subject, String body);

    void sendAdminMail(String subject, String body);
}
