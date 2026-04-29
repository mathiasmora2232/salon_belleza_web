package com.salonbelleza.app.dto;

import lombok.Data;

@Data
public class UsuarioRequest {
    private String username;
    private String email;
    private String password;
    private String nombreCompleto;
    private String telefono;
    private Long rolId;
    private String estado;
}
