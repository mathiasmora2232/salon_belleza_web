package com.salonbelleza.app.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {

    @Schema(description = "Refresh token devuelto por login.", example = "pega_aqui_el_refresh_token")
    @NotBlank
    private String refreshToken;
}
