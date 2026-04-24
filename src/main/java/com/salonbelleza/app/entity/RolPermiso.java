package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rol_permisos",
    uniqueConstraints = @UniqueConstraint(columnNames = {"rol_id", "permiso_id"}))
public class RolPermiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "permiso_id", nullable = false)
    private Permiso permiso;

    @Column(name = "estado", length = 1, columnDefinition = "CHAR(1) DEFAULT 'A'")
    private String estado;
}
