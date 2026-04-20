package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "password_resets",
    indexes = {
        @Index(name = "idx_password_resets_usuario_id", columnList = "usuario_id"),
        @Index(name = "idx_password_resets_expira_en", columnList = "expira_en")
    })
public class PasswordReset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "token_hash", length = 255, unique = true, nullable = false)
    private String tokenHash;

    @Column(name = "expira_en", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime expiraEn;

    @Column(name = "usado_en", columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime usadoEn;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "created_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime createdAt;
}
