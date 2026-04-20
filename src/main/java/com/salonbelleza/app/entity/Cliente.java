package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "clientes",
    indexes = {
        @Index(name = "idx_clientes_nombre_apellido", columnList = "nombre, apellido"),
        @Index(name = "idx_clientes_telefono", columnList = "telefono"),
        @Index(name = "idx_clientes_estado", columnList = "estado")
    })
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_identificacion", length = 10, columnDefinition = "VARCHAR(10) DEFAULT 'CEDULA'")
    private String tipoIdentificacion;

    @Column(name = "numero_identificacion", length = 20, unique = true)
    private String numeroIdentificacion;

    @Column(name = "nombre", length = 100, nullable = false)
    private String nombre;

    @Column(name = "apellido", length = 100)
    private String apellido;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "email", length = 120)
    private String email;

    @Column(name = "genero", length = 20)
    private String genero;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "direccion", length = 200)
    private String direccion;

    @Column(name = "ciudad", length = 60)
    private String ciudad;

    @Column(name = "fecha_registro", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime fechaRegistro;

    @Column(name = "estado", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'Activo'")
    private String estado;

    @Column(name = "eliminado_en", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime eliminadoEn;

    @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime updatedAt;
}
