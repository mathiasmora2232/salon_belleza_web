package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CajaVentaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CajaVentaItemRepository extends JpaRepository<CajaVentaItem, Long> {
    List<CajaVentaItem> findByVentaId(Long ventaId);
}
