package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.ServicioInsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServicioInsumoRepository extends JpaRepository<ServicioInsumo, Long> {

    List<ServicioInsumo> findByServicioId(Long servicioId);

    List<ServicioInsumo> findByProductoId(Long productoId);
}
