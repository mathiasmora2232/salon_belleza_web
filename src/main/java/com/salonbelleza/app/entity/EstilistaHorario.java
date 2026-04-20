package com.salonbelleza.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "estilista_horarios",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_estilista_dia_inicio",
            columnNames = {"estilista_id", "dia_semana", "hora_inicio"})
    })
public class EstilistaHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estilista_id", nullable = false)
    private Estilista estilista;

    @Column(name = "dia_semana", columnDefinition = "SMALLINT")
    private Short diaSemana;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fin")
    private LocalTime horaFin;

    @Column(name = "activo", columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo;
}
