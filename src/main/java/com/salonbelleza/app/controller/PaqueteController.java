package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.PaqueteRequest;
import com.salonbelleza.app.entity.Paquete;
import com.salonbelleza.app.service.PaqueteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/paquetes")
@RequiredArgsConstructor
public class PaqueteController {

    private final PaqueteService paqueteService;

    @GetMapping
    public ResponseEntity<List<Paquete>> getAll() {
        return ResponseEntity.ok(paqueteService.findAll());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Paquete>> getByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(paqueteService.findByEstado(estado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paquete> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paqueteService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Paquete> create(@RequestBody PaqueteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paqueteService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paquete> update(@PathVariable Long id, @RequestBody PaqueteRequest req) {
        return ResponseEntity.ok(paqueteService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paqueteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
