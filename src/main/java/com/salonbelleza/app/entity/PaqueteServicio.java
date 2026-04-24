package com.salonbelleza.app.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "paquete_servicios",
       uniqueConstraints = @UniqueConstraint(columnNames = {"paquete_id", "servicio_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaqueteServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paquete_id", nullable = false)
    private Paquete paquete;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "servicio_id", nullable = false)
    private Servicio servicio;

    @Column(name = "orden", columnDefinition = "SMALLINT DEFAULT 1")
    private Short orden;
}
