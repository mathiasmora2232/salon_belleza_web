package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.RolPermisoRequest;
import com.salonbelleza.app.entity.*;
import com.salonbelleza.app.service.SeguridadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/seguridad")
@RequiredArgsConstructor
public class SeguridadController {

    private final SeguridadService seguridadService;

    @GetMapping("/tipo-recurso")
    public ResponseEntity<List<TipoRecurso>> getTipoRecurso() {
        return ResponseEntity.ok(seguridadService.findAllTipoRecurso());
    }

    @GetMapping("/acciones")
    public ResponseEntity<List<Accion>> getAcciones() {
        return ResponseEntity.ok(seguridadService.findAllAcciones());
    }

    @GetMapping("/recursos")
    public ResponseEntity<List<Recurso>> getRecursos() {
        return ResponseEntity.ok(seguridadService.findAllRecursos());
    }

    @GetMapping("/permisos")
    public ResponseEntity<List<Permiso>> getPermisos() {
        return ResponseEntity.ok(seguridadService.findAllPermisos());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Rol>> getRoles() {
        return ResponseEntity.ok(seguridadService.findAllRoles());
    }

    @GetMapping("/rol/{rolId}/permisos")
    public ResponseEntity<List<Long>> getPermisosByRol(@PathVariable Long rolId) {
        return ResponseEntity.ok(seguridadService.findPermisoIdsByRolId(rolId));
    }

    @PostMapping("/rol-permisos")
    public ResponseEntity<RolPermiso> assign(@RequestBody RolPermisoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(seguridadService.assign(req.getRolId(), req.getPermisoId()));
    }

    @DeleteMapping("/rol-permisos/{rolId}/{permisoId}")
    public ResponseEntity<Void> revoke(@PathVariable Long rolId, @PathVariable Long permisoId) {
        seguridadService.revoke(rolId, permisoId);
        return ResponseEntity.noContent().build();
    }
}
