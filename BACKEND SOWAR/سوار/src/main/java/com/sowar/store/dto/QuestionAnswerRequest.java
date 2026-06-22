package com.sowar.store.dto;

import jakarta.validation.constraints.NotBlank;

public record QuestionAnswerRequest(@NotBlank String answer) {
}
