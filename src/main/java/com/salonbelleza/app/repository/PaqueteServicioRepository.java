package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.PaqueteServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaqueteServicioRepository extends JpaRepository<PaqueteServicio, Long> {
    List<PaqueteServicio> findByPaqueteId(Long paqueteId);
    void deleteByPaqueteId(Long paqueteId);
}
