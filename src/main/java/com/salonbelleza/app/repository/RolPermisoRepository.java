package com.salonbelleza.app.repository;

import com.salonbelleza.app.entity.RolPermiso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface RolPermisoRepository extends JpaRepository<RolPermiso, Long> {
    List<RolPermiso> findByRolId(Long rolId);
    Optional<RolPermiso> findByRolIdAndPermisoId(Long rolId, Long permisoId);
    boolean existsByRolIdAndPermisoId(Long rolId, Long permisoId);

    @Transactional
    void deleteByRolIdAndPermisoId(Long rolId, Long permisoId);
}
