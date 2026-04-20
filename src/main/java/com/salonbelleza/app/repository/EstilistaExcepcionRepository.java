package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.EstilistaExcepcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EstilistaExcepcionRepository extends JpaRepository<EstilistaExcepcion, Long> {

    List<EstilistaExcepcion> findByEstilistaId(Long estilistaId);

    List<EstilistaExcepcion> findByEstilistaIdAndFecha(Long estilistaId, LocalDate fecha);
}
