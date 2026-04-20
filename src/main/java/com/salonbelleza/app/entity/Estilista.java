package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "estilistas")
public class Estilista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "especialidad", length = 100)
    private String especialidad;

    @Column(name = "experiencia_anios", columnDefinition = "SMALLINT")
    private Short experienciaAnios;

    @Column(name = "comision_porcentaje", precision = 5, scale = 2, columnDefinition = "NUMERIC(5,2) DEFAULT 0")
    private BigDecimal comisionPorcentaje;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    @Column(name = "fecha_salida")
    private LocalDate fechaSalida;

    @Column(name = "estado", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'Activo'")
    private String estado;

    @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime updatedAt;
}
