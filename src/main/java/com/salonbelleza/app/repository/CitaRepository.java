package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
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

    @Query("SELECT COUNT(c) FROM Cita c WHERE c.fecha = :fecha AND c.estado.codigo IN :codigos")
    long countByFechaAndEstadoCodigoIn(@Param("fecha") LocalDate fecha, @Param("codigos") List<String> codigos);

    @Query("SELECT c FROM Cita c WHERE c.estado.codigo = 'COMPLETADA' " +
           "AND NOT EXISTS (SELECT f FROM Factura f WHERE f.cita = c)")
    List<Cita> findCompletadasSinFactura();

    @Query("SELECT c FROM Cita c WHERE c.fecha = :fecha ORDER BY c.horaInicio ASC")
    List<Cita> findByFechaOrderByHoraInicio(@Param("fecha") LocalDate fecha);

    @Query("SELECT COUNT(c) FROM Cita c WHERE c.fecha = :fecha " +
           "AND c.horaInicio < :horaFin AND c.horaFin > :horaInicio " +
           "AND c.estado.codigo NOT IN :excluidos")
    long countOverlapping(@Param("fecha") LocalDate fecha,
                          @Param("horaInicio") LocalTime horaInicio,
                          @Param("horaFin") LocalTime horaFin,
                          @Param("excluidos") List<String> excluidos);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN TRUE ELSE FALSE END FROM Cita c " +
           "WHERE c.estilista.id = :estilistaId AND c.fecha = :fecha " +
           "AND c.horaInicio < :horaFin AND c.horaFin > :horaInicio " +
           "AND c.estado.codigo NOT IN :excluidos")
    boolean existsConflictoEstilista(@Param("estilistaId") Long estilistaId,
                                     @Param("fecha") LocalDate fecha,
                                     @Param("horaInicio") LocalTime horaInicio,
                                     @Param("horaFin") LocalTime horaFin,
                                     @Param("excluidos") List<String> excluidos);

    @Query("SELECT c FROM Cita c LEFT JOIN FETCH c.cliente LEFT JOIN FETCH c.estilista " +
           "LEFT JOIN FETCH c.estado WHERE c.fecha BETWEEN :inicio AND :fin ORDER BY c.fecha, c.horaInicio")
    List<Cita> findByFechaBetweenWithDetails(@Param("inicio") LocalDate inicio,
                                              @Param("fin") LocalDate fin);
}
