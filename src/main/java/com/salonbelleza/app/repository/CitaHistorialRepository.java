package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CitaHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CitaHistorialRepository extends JpaRepository<CitaHistorial, Long> {

    List<CitaHistorial> findByCitaIdOrderByCreatedAtAsc(Long citaId);
}
