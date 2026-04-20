package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.CategoriaServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoriaServicioRepository extends JpaRepository<CategoriaServicio, Long> {

    List<CategoriaServicio> findByActivoTrue();

    List<CategoriaServicio> findAllByOrderByOrdenAsc();
}
