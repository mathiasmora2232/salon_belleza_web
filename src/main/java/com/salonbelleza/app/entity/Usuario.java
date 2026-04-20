package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuarios",
    indexes = {
        @Index(name = "idx_usuarios_email", columnList = "email"),
        @Index(name = "idx_usuarios_estado", columnList = "estado")
    })
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rol_id")
    private Rol rol;

    @Column(name = "username", length = 50, unique = true, nullable = false)
    private String username;

    @Column(name = "email", length = 120, unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "nombre_completo", length = 100, nullable = false)
    private String nombreCompleto;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "ultimo_login", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime ultimoLogin;

    @Column(name = "intentos_fallidos", columnDefinition = "SMALLINT DEFAULT 0")
    private Short intentosFallidos;

    @Column(name = "bloqueado_hasta", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime bloqueadoHasta;

    @Column(name = "debe_cambiar_pass", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean debeCambiarPass;

    @Column(name = "estado", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'Activo'")
    private String estado;

    @Column(name = "eliminado_en", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime eliminadoEn;

    @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime updatedAt;
}
