package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {

    List<Factura> findByClienteId(Long clienteId);

    List<Factura> findByEstado(String estado);

    Optional<Factura> findByCitaId(Long citaId);

    Optional<Factura> findByNumero(String numero);
}
