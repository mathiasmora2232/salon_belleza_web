package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.ClienteFicha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteFichaRepository extends JpaRepository<ClienteFicha, Long> {
}
