package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.EstilistaHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EstilistaHorarioRepository extends JpaRepository<EstilistaHorario, Long> {

    List<EstilistaHorario> findByEstilistaId(Long estilistaId);

    List<EstilistaHorario> findByEstilistaIdAndActivo(Long estilistaId, Boolean activo);
}
