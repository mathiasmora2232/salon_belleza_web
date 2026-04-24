package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Accion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccionRepository extends JpaRepository<Accion, Long> {
    List<Accion> findByEstado(String estado);
    List<Accion> findByTipoRecursoId(Long tipoRecursoId);
}
