package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CitaServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CitaServicioRepository extends JpaRepository<CitaServicio, Long> {

    List<CitaServicio> findByCitaId(Long citaId);

    List<CitaServicio> findByEstilistaId(Long estilistaId);
}
