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
@Table(name = "comisiones")
public class Comision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_item_id", unique = true)
    private FacturaItem facturaItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estilista_id")
    private Estilista estilista;

    @Column(name = "base_calculo", precision = 10, scale = 2)
    private BigDecimal baseCalculo;

    @Column(name = "porcentaje", precision = 5, scale = 2)
    private BigDecimal porcentaje;

    @Column(name = "monto", precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "estado", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'Pendiente'")
    private String estado;

    @Column(name = "periodo", length = 7)
    private String periodo;

    @Column(name = "liquidada_en", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime liquidadaEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "liquidada_por")
    private Usuario liquidadaPor;

    @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime createdAt;
}
