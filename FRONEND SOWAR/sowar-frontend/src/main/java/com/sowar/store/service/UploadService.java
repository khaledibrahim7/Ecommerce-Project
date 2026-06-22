package com.sowar.store.service;

import com.sowar.store.dto.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UploadService {
    UploadResponse uploadImage(MultipartFile file);
}

