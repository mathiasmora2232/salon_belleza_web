package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecursoRepository extends JpaRepository<Recurso, Long> {
    List<Recurso> findByEstado(String estado);
    List<Recurso> findByTipoRecursoNombre(String tipoRecursoNombre);
}
