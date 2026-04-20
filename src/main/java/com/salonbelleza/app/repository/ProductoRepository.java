package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByCategoriaIdAndEstado(Long categoriaId, String estado);

    List<Producto> findByEstado(String estado);

    Optional<Producto> findBySku(String sku);

    Optional<Producto> findByCodigoBarras(String codigoBarras);

    @Query("SELECT p FROM Producto p WHERE p.stockActual <= p.stockMinimo AND p.estado = 'Activo'")
    List<Producto> findProductosBajoStockMinimo();

    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}
