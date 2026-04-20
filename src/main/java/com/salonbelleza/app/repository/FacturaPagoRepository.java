package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.FacturaPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FacturaPagoRepository extends JpaRepository<FacturaPago, Long> {

    List<FacturaPago> findByFacturaId(Long facturaId);

    List<FacturaPago> findByMetodoPagoId(Long metodoPagoId);
}
