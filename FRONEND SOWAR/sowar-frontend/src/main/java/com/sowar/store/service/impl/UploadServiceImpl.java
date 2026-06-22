package com.sowar.store.service.impl;




import com.sowar.store.dto.*;
import com.sowar.store.common.ApiException;
import com.sowar.store.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    @Value("${app.upload-dir}")
    private Path uploadDir;



    public UploadResponse uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image is required");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPEG, PNG, and WEBP images are allowed");
        }
        try {
            Files.createDirectories(uploadDir);
            String extension = extension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + extension;
            Path target = uploadDir.resolve(fileName).normalize();
            file.transferTo(target);
            return new UploadResponse("/uploads/" + fileName, fileName);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload image");
        }
    }

    private String extension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ".jpg";
        }
        return originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
    }
}
