package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "permisos",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"nombre"}),
        @UniqueConstraint(columnNames = {"accion_id", "recurso_id"})
    })
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", length = 150, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "accion_id", nullable = false)
    private Accion accion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recurso_id", nullable = false)
    private Recurso recurso;

    @Column(name = "dominio", length = 100)
    private String dominio;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_recurso_id")
    private TipoRecurso tipoRecurso;

    @Column(name = "estado", length = 1, columnDefinition = "CHAR(1) DEFAULT 'A'")
    private String estado;
}
