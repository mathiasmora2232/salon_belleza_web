package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.ReporteEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReporteEventoRepository extends JpaRepository<ReporteEvento, Long> {
    Optional<ReporteEvento> findByCitaId(Long citaId);
    boolean existsByCitaId(Long citaId);
}
