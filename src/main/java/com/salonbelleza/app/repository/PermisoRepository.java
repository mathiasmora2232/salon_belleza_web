package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PermisoRepository extends JpaRepository<Permiso, Long> {
    List<Permiso> findByEstado(String estado);
    List<Permiso> findByRecursoId(Long recursoId);
    List<Permiso> findByTipoRecursoNombre(String tipoRecursoNombre);
}
