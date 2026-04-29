package com.salonbelleza.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long citasHoy;
    private long citasCanceladasHoy;
    private long citasPendientesFactura;
    private long clientesActivos;
    private long clientesNuevosHoy;
    private long clientesRecurrentes;
    private long estilistaActivos;
    private long serviciosActivos;
    private long productosActivos;
    private long stockBajo;
    private long facturasPendientes;
    private BigDecimal ingresosDia;
    private BigDecimal ingresosMesActual;
}
