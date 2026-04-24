package com.salonbelleza.app.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PaqueteRequest {
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal precioReferencia;
    private Integer duracionMin;
    private BigDecimal descuentoPorcentaje;
    private String estado;
    private String imagenUrl;
    private List<Long> servicioIds;
}
