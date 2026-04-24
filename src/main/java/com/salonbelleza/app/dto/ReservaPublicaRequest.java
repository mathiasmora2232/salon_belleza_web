package com.salonbelleza.app.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservaPublicaRequest {
    private String nombre;
    private String apellido;
    private String telefono;
    private String email;
    private Long servicioId;
    private Long estilistaId;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private String observaciones;
}
