package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    List<Cliente> findByNombreContainingIgnoreCase(String nombre);

    Optional<Cliente> findByTelefono(String telefono);

    List<Cliente> findByEstado(String estado);

    Optional<Cliente> findByNumeroIdentificacion(String numeroIdentificacion);

    List<Cliente> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);

    long countByEstado(String estado);

    @Query(value = "SELECT COUNT(*) FROM clientes WHERE DATE(fecha_registro) = :fecha", nativeQuery = true)
    long countRegistradosEnFecha(@Param("fecha") LocalDate fecha);

    @Query(value = "SELECT COUNT(*) FROM (SELECT cliente_id FROM citas WHERE cliente_id IS NOT NULL GROUP BY cliente_id HAVING COUNT(*) > 1) recurrentes", nativeQuery = true)
    long countClientesRecurrentes();
}
