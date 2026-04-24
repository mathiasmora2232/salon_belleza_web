package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "acciones")
public class Accion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", length = 50, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_recurso_id", nullable = false)
    private TipoRecurso tipoRecurso;

    @Column(name = "estado", length = 1, columnDefinition = "CHAR(1) DEFAULT 'A'")
    private String estado;
}
