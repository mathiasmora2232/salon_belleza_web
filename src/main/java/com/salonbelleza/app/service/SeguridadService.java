package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.*;
import com.salonbelleza.app.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeguridadService {

    private final TipoRecursoRepository tipoRecursoRepository;
    private final AccionRepository      accionRepository;
    private final RecursoRepository     recursoRepository;
    private final PermisoRepository     permisoRepository;
    private final RolPermisoRepository  rolPermisoRepository;
    private final RolRepository         rolRepository;

    public List<TipoRecurso> findAllTipoRecurso() {
        return tipoRecursoRepository.findAll(Sort.by("id"));
    }

    public List<Accion> findAllAcciones() {
        return accionRepository.findAll(Sort.by("id"));
    }

    public List<Recurso> findAllRecursos() {
        return recursoRepository.findAll(Sort.by("tipoRecurso.id", "nombre"));
    }

    public List<Permiso> findAllPermisos() {
        return permisoRepository.findAll(Sort.by("recurso.nombre", "accion.nombre"));
    }

    public List<Rol> findAllRoles() {
        return rolRepository.findAll(Sort.by("nombre"));
    }

    public List<Long> findPermisoIdsByRolId(Long rolId) {
        return rolPermisoRepository.findByRolId(rolId)
                .stream()
                .map(rp -> rp.getPermiso().getId())
                .toList();
    }

    @Transactional
    public RolPermiso assign(Long rolId, Long permisoId) {
        if (rolPermisoRepository.existsByRolIdAndPermisoId(rolId, permisoId)) {
            return rolPermisoRepository.findByRolIdAndPermisoId(rolId, permisoId).orElseThrow();
        }
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado: " + rolId));
        Permiso permiso = permisoRepository.findById(permisoId)
                .orElseThrow(() -> new EntityNotFoundException("Permiso no encontrado: " + permisoId));
        return rolPermisoRepository.save(
                RolPermiso.builder().rol(rol).permiso(permiso).estado("A").build());
    }

    @Transactional
    public void revoke(Long rolId, Long permisoId) {
        rolPermisoRepository.deleteByRolIdAndPermisoId(rolId, permisoId);
    }
}
