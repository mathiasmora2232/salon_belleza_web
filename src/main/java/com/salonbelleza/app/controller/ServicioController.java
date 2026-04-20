package com.salonbelleza.app.controller;

import com.salonbelleza.app.entity.CategoriaServicio;
import com.salonbelleza.app.entity.Servicio;
import com.salonbelleza.app.service.ServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioService servicioService;

    @GetMapping
    public ResponseEntity<List<Servicio>> getAll() {
        return ResponseEntity.ok(servicioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> getById(@PathVariable Long id) {
        return ResponseEntity.ok(servicioService.findById(id));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Servicio>> getByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(servicioService.findByEstado(estado));
    }

    @GetMapping("/categoria/{categoriaId}/estado/{estado}")
    public ResponseEntity<List<Servicio>> getByCategoriaAndEstado(@PathVariable Long categoriaId,
                                                                    @PathVariable String estado) {
        return ResponseEntity.ok(servicioService.findByCategoriaAndEstado(categoriaId, estado));
    }

    @PostMapping
    public ResponseEntity<Servicio> create(@RequestBody Servicio servicio) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicioService.save(servicio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servicio> update(@PathVariable Long id, @RequestBody Servicio servicio) {
        return ResponseEntity.ok(servicioService.update(id, servicio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        servicioService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Categorias

    @GetMapping("/categorias")
    public ResponseEntity<List<CategoriaServicio>> getAllCategorias() {
        return ResponseEntity.ok(servicioService.findAllCategorias());
    }

    @GetMapping("/categorias/{id}")
    public ResponseEntity<CategoriaServicio> getCategoriaById(@PathVariable Long id) {
        return ResponseEntity.ok(servicioService.findCategoriaById(id));
    }

    @PostMapping("/categorias")
    public ResponseEntity<CategoriaServicio> createCategoria(@RequestBody CategoriaServicio categoria) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicioService.saveCategoria(categoria));
    }

    @PutMapping("/categorias/{id}")
    public ResponseEntity<CategoriaServicio> updateCategoria(@PathVariable Long id,
                                                              @RequestBody CategoriaServicio categoria) {
        categoria.setId(id);
        return ResponseEntity.ok(servicioService.saveCategoria(categoria));
    }

    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<Void> deleteCategoria(@PathVariable Long id) {
        servicioService.deleteCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
