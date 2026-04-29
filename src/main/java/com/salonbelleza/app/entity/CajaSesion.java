package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "caja_sesiones")
public class CajaSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", length = 30, unique = true, nullable = false)
    private String codigo;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @Column(name = "abierta_en", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime abiertaEn;

    @Column(name = "cerrada_en", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime cerradaEn;

    @Column(name = "monto_inicial", precision = 10, scale = 2)
    private BigDecimal montoInicial;

    @Column(name = "efectivo_esperado", precision = 10, scale = 2)
    private BigDecimal efectivoEsperado;

    @Column(name = "efectivo_contado", precision = 10, scale = 2)
    private BigDecimal efectivoContado;

    @Column(name = "diferencia", precision = 10, scale = 2)
    private BigDecimal diferencia;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
}
