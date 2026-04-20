package com.salonbelleza.app.controller;

import com.salonbelleza.app.entity.Comision;
import com.salonbelleza.app.service.ComisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/comisiones")
@RequiredArgsConstructor
public class ComisionController {

    private final ComisionService comisionService;

    @GetMapping
    public ResponseEntity<List<Comision>> getAll() {
        return ResponseEntity.ok(comisionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comision> getById(@PathVariable Long id) {
        return ResponseEntity.ok(comisionService.findById(id));
    }

    @GetMapping("/estilista/{estilistaId}")
    public ResponseEntity<List<Comision>> getByEstilista(@PathVariable Long estilistaId) {
        return ResponseEntity.ok(comisionService.findByEstilista(estilistaId));
    }

    @GetMapping("/estilista/{estilistaId}/estado/{estado}")
    public ResponseEntity<List<Comision>> getByEstilistaAndEstado(@PathVariable Long estilistaId,
                                                                    @PathVariable String estado) {
        return ResponseEntity.ok(comisionService.findByEstilistaAndEstado(estilistaId, estado));
    }

    @GetMapping("/periodo/{periodo}")
    public ResponseEntity<List<Comision>> getByPeriodo(@PathVariable String periodo) {
        return ResponseEntity.ok(comisionService.findByPeriodo(periodo));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Comision>> getByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(comisionService.findByEstado(estado));
    }

    @PostMapping
    public ResponseEntity<Comision> create(@RequestBody Comision comision) {
        return ResponseEntity.status(HttpStatus.CREATED).body(comisionService.save(comision));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comision> update(@PathVariable Long id, @RequestBody Comision comision) {
        return ResponseEntity.ok(comisionService.update(id, comision));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        comisionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
