package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "configuracion")
public class Configuracion {

    @Id
    @Column(name = "clave", length = 60)
    private String clave;

    @Column(name = "valor", columnDefinition = "TEXT", nullable = false)
    private String valor;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "tipo_dato", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'texto'")
    private String tipoDato;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMPTZ DEFAULT NOW()")
    private OffsetDateTime updatedAt;
}
