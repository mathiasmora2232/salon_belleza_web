package com.salonbelleza.app.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @Schema(
            description = "Email o username del usuario.",
            example = "admin"
    )
    @NotBlank
    private String email;

    @Schema(example = "12")
    @NotBlank
    private String password;
}
