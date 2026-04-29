package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {

    List<Factura> findByClienteId(Long clienteId);

    List<Factura> findByEstado(String estado);

    Optional<Factura> findByCitaId(Long citaId);

    Optional<Factura> findByNumero(String numero);

    long countByEstado(String estado);

    @Query("SELECT COALESCE(SUM(f.total), 0) FROM Factura f " +
           "WHERE f.estado = 'PAGADA' " +
           "AND YEAR(CAST(f.fecha AS LocalDateTime)) = :year " +
           "AND MONTH(CAST(f.fecha AS LocalDateTime)) = :month")
    BigDecimal sumIngresosDelMes(@Param("year") int year, @Param("month") int month);

    @Query(value = "SELECT COALESCE(SUM(total), 0) FROM facturas " +
                   "WHERE estado = 'PAGADA' " +
                   "AND EXTRACT(YEAR FROM fecha) = :year " +
                   "AND EXTRACT(MONTH FROM fecha) = :month",
           nativeQuery = true)
    BigDecimal sumIngresosDelMesNative(@Param("year") int year, @Param("month") int month);

    @Query(value = "SELECT COALESCE(SUM(total), 0) FROM facturas " +
                   "WHERE estado = 'PAGADA' AND DATE(fecha) = CURRENT_DATE",
           nativeQuery = true)
    BigDecimal sumIngresosDiaNative();
}
