package com.salonbelleza.app.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record CitaCalendarioDto(
    Long id,
    String clienteNombre,
    String clienteTelefono,
    String estillistaNombre,
    LocalDate fecha,
    LocalTime horaInicio,
    LocalTime horaFin,
    String estadoCodigo,
    String estadoNombre,
    String estadoColor,
    boolean esEvento
) {}
