package com.salonbelleza.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paquetes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Paquete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", length = 120, nullable = false)
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio", precision = 10, scale = 2, nullable = false)
    private BigDecimal precio;

    @Column(name = "precio_referencia", precision = 10, scale = 2)
    private BigDecimal precioReferencia;

    @Column(name = "duracion_min", nullable = false)
    private Integer duracionMin;

    @Column(name = "descuento_porcentaje", precision = 5, scale = 2,
            columnDefinition = "NUMERIC(5,2) DEFAULT 0")
    private BigDecimal descuentoPorcentaje;

    @Column(name = "estado", length = 20,
            columnDefinition = "VARCHAR(20) DEFAULT 'Activo'")
    private String estado;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    @OneToMany(mappedBy = "paquete", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PaqueteServicio> servicios = new ArrayList<>();

    @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime updatedAt;
}
