package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.Configuracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConfiguracionRepository extends JpaRepository<Configuracion, String> {

    List<Configuracion> findByTipoDato(String tipoDato);
}
