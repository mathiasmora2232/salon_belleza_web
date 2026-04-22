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
    private long citasPendientesFactura;
    private long clientesActivos;
    private long estilistaActivos;
    private long serviciosActivos;
    private long facturasPendientes;
    private BigDecimal ingresosMesActual;
}
