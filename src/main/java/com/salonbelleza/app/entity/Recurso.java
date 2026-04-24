package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "recursos")
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_recurso_id", nullable = false)
    private TipoRecurso tipoRecurso;

    @Column(name = "ruta", length = 150)
    private String ruta;

    @Column(name = "estado", length = 1, columnDefinition = "CHAR(1) DEFAULT 'A'")
    private String estado;
}
