package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cita_estados")
public class CitaEstado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", length = 20, unique = true, nullable = false)
    private String codigo;

    @Column(name = "nombre", length = 40, nullable = false)
    private String nombre;

    @Column(name = "color_hex", length = 7)
    private String colorHex;

    @Column(name = "es_final", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean esFinal;

    @Column(name = "orden", columnDefinition = "SMALLINT DEFAULT 0")
    private Short orden;
}
