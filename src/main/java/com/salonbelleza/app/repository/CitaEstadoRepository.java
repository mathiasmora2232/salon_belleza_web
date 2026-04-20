package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CitaEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CitaEstadoRepository extends JpaRepository<CitaEstado, Long> {

    Optional<CitaEstado> findByCodigo(String codigo);
}
