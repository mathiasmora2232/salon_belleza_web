package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaqueteRepository extends JpaRepository<Paquete, Long> {
    List<Paquete> findByEstado(String estado);
}
