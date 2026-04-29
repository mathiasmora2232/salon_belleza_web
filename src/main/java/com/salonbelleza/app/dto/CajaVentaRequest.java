package com.salonbelleza.app.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class CajaVentaRequest {
    private Long clienteId;
    private BigDecimal descuento = BigDecimal.ZERO;
    private String observaciones;
    private List<Item> items = new ArrayList<>();
    private List<Pago> pagos = new ArrayList<>();

    @Data
    public static class Item {
        private String tipo;
        private Long referenciaId;
        private String descripcion;
        private BigDecimal cantidad = BigDecimal.ONE;
        private BigDecimal precioUnitario = BigDecimal.ZERO;
        private BigDecimal descuento = BigDecimal.ZERO;
    }

    @Data
    public static class Pago {
        private String metodo;
        private BigDecimal monto = BigDecimal.ZERO;
        private String referencia;
    }
}
