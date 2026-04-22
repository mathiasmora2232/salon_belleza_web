package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    List<Servicio> findByCategoriaIdAndEstado(Long categoriaId, String estado);

    List<Servicio> findByEstado(String estado);

    List<Servicio> findByCategoriaId(Long categoriaId);

    long countByEstado(String estado);
}
