package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CajaSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CajaSesionRepository extends JpaRepository<CajaSesion, Long> {
    Optional<CajaSesion> findFirstByEstadoOrderByAbiertaEnDesc(String estado);
}
