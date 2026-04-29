package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CajaMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CajaMovimientoRepository extends JpaRepository<CajaMovimiento, Long> {
    List<CajaMovimiento> findByCajaSesionIdOrderByCreatedAtDesc(Long cajaSesionId);
}
