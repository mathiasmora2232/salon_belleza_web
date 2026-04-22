package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByFechaAndEstilistaId(LocalDate fecha, Long estilistaId);

    List<Cita> findByClienteId(Long clienteId);

    List<Cita> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);

    List<Cita> findByEstilistaIdAndFechaBetween(Long estilistaId, LocalDate fechaInicio, LocalDate fechaFin);

    List<Cita> findByEstadoId(Long estadoId);

    List<Cita> findByFecha(LocalDate fecha);

    long countByFecha(LocalDate fecha);

    @Query("SELECT c FROM Cita c WHERE c.estado.codigo = 'COMPLETADA' " +
           "AND NOT EXISTS (SELECT f FROM Factura f WHERE f.cita = c)")
    List<Cita> findCompletadasSinFactura();

    @Query("SELECT c FROM Cita c WHERE c.fecha = :fecha ORDER BY c.horaInicio ASC")
    List<Cita> findByFechaOrderByHoraInicio(@Param("fecha") LocalDate fecha);
}
