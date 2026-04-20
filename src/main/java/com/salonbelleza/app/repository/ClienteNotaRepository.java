package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.ClienteNota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClienteNotaRepository extends JpaRepository<ClienteNota, Long> {

    List<ClienteNota> findByClienteId(Long clienteId);

    List<ClienteNota> findByClienteIdAndTipo(Long clienteId, String tipo);
}
