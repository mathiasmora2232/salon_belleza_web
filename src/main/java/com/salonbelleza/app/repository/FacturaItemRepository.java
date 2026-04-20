package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.FacturaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FacturaItemRepository extends JpaRepository<FacturaItem, Long> {

    List<FacturaItem> findByFacturaId(Long facturaId);

    List<FacturaItem> findByEstilistaId(Long estilistaId);
}
