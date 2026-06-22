package com.sowar.store.dto;

import jakarta.validation.constraints.NotBlank;

public record QuestionRequest(@NotBlank String question) {
}
