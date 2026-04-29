package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CajaVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CajaVentaRepository extends JpaRepository<CajaVenta, Long> {
    List<CajaVenta> findByCajaSesionIdOrderByFechaDesc(Long cajaSesionId);
    List<CajaVenta> findByClienteIdOrderByFechaDesc(Long clienteId);
}
