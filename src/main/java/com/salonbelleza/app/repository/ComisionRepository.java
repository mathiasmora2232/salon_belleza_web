package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Comision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComisionRepository extends JpaRepository<Comision, Long> {

    List<Comision> findByEstilistaIdAndEstado(Long estilistaId, String estado);

    List<Comision> findByPeriodo(String periodo);

    List<Comision> findByEstilistaId(Long estilistaId);

    List<Comision> findByEstado(String estado);

    List<Comision> findByEstilistaIdAndPeriodo(Long estilistaId, String periodo);
}
