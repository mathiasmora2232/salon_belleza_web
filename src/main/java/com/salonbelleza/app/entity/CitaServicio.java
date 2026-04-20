package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cita_servicios")
public class CitaServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cita_id", nullable = false)
    private Cita cita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estilista_id")
    private Estilista estilista;

    @Column(name = "precio_aplicado", precision = 10, scale = 2)
    private BigDecimal precioAplicado;

    @Column(name = "duracion_aplicada")
    private Integer duracionAplicada;

    @Column(name = "orden", columnDefinition = "SMALLINT DEFAULT 1")
    private Short orden;
}
