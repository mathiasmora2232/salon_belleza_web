package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.TipoRecurso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TipoRecursoRepository extends JpaRepository<TipoRecurso, Long> {
    List<TipoRecurso> findByEstado(String estado);
}
