package com.salonbelleza.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "categorias_servicios")
public class CategoriaServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", length = 60, unique = true, nullable = false)
    private String nombre;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "icono", length = 50)
    private String icono;

    @Column(name = "orden", columnDefinition = "SMALLINT DEFAULT 0")
    private Short orden;

    @Column(name = "activo", columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo;
}
