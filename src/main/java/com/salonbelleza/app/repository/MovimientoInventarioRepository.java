package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    List<MovimientoInventario> findByProductoId(Long productoId);

    List<MovimientoInventario> findByTipo(String tipo);

    List<MovimientoInventario> findByProductoIdAndTipo(Long productoId, String tipo);
}
