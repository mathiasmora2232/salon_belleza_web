package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cliente_fichas")
public class ClienteFicha {

    @Id
    @Column(name = "cliente_id")
    private Long clienteId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "tipo_cabello", length = 60)
    private String tipoCabello;

    @Column(name = "tipo_piel", length = 60)
    private String tipoPiel;

    @Column(name = "alergias", columnDefinition = "TEXT")
    private String alergias;

    @Column(name = "condiciones_medicas", columnDefinition = "TEXT")
    private String condicionesMedicas;

    @Column(name = "productos_evitar", columnDefinition = "TEXT")
    private String productosEvitar;

    @Column(name = "preferencias", columnDefinition = "TEXT")
    private String preferencias;

    @Column(name = "notas", columnDefinition = "TEXT")
    private String notas;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime updatedAt;
}
