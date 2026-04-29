package com.salonbelleza.app.dto;

import java.time.LocalTime;

public record SlotDto(
    LocalTime hora,
    int capacidad,
    int ocupados,
    int disponibles,
    boolean lleno
) {}
