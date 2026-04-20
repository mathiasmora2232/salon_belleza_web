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
@Table(name = "facturas")
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero", length = 20, unique = true, nullable = false)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cita_id")
    private Cita cita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "fecha", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime fecha;

    @Column(name = "subtotal", precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "descuento", precision = 10, scale = 2)
    private BigDecimal descuento;

    @Column(name = "impuesto_monto", precision = 10, scale = 2)
    private BigDecimal impuestoMonto;

    @Column(name = "total", precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "pagado", precision = 10, scale = 2)
    private BigDecimal pagado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "impuesto_id")
    private Impuesto impuesto;

    @Column(name = "estado", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'BORRADOR'")
    private String estado;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "anulada_en", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime anuladaEn;

    @Column(name = "anulada_motivo", columnDefinition = "TEXT")
    private String anuladaMotivo;

    @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime updatedAt;
}
