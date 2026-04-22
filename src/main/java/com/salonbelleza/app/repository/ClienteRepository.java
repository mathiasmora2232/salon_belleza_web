package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
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
}
