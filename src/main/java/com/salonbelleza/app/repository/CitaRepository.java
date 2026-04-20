package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
