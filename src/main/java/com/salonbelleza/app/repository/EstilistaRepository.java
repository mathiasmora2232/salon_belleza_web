package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Estilista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EstilistaRepository extends JpaRepository<Estilista, Long> {

    List<Estilista> findByEstado(String estado);

    Optional<Estilista> findByUsuarioId(Long usuarioId);

    long countByEstado(String estado);
}
