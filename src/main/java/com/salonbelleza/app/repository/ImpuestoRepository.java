package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Impuesto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImpuestoRepository extends JpaRepository<Impuesto, Long> {

    List<Impuesto> findByActivoTrue();

    Optional<Impuesto> findByEsDefaultTrue();
}
