package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CajaVentaPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CajaVentaPagoRepository extends JpaRepository<CajaVentaPago, Long> {
    List<CajaVentaPago> findByVentaId(Long ventaId);
}
