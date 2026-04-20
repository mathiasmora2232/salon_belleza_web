package com.salonbelleza.app.controller;

import com.salonbelleza.app.entity.Estilista;
import com.salonbelleza.app.entity.EstilistaExcepcion;
import com.salonbelleza.app.entity.EstilistaHorario;
import com.salonbelleza.app.service.EstilistaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/estilistas")
@RequiredArgsConstructor
public class EstilistaController {

    private final EstilistaService estilistaService;

    @GetMapping
    public ResponseEntity<List<Estilista>> getAll() {
        return ResponseEntity.ok(estilistaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Estilista> getById(@PathVariable Long id) {
        return ResponseEntity.ok(estilistaService.findById(id));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Estilista>> getByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(estilistaService.findByEstado(estado));
    }

    @PostMapping
    public ResponseEntity<Estilista> create(@RequestBody Estilista estilista) {
        return ResponseEntity.status(HttpStatus.CREATED).body(estilistaService.save(estilista));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Estilista> update(@PathVariable Long id, @RequestBody Estilista estilista) {
        return ResponseEntity.ok(estilistaService.update(id, estilista));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        estilistaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Horarios

    @GetMapping("/{id}/horarios")
    public ResponseEntity<List<EstilistaHorario>> getHorarios(@PathVariable Long id) {
        return ResponseEntity.ok(estilistaService.findHorariosByEstilista(id));
    }

    @PostMapping("/{id}/horarios")
    public ResponseEntity<EstilistaHorario> addHorario(@PathVariable Long id,
                                                        @RequestBody EstilistaHorario horario) {
        horario.setEstilista(estilistaService.findById(id));
        return ResponseEntity.status(HttpStatus.CREATED).body(estilistaService.saveHorario(horario));
    }

    @DeleteMapping("/horarios/{horarioId}")
    public ResponseEntity<Void> deleteHorario(@PathVariable Long horarioId) {
        estilistaService.deleteHorario(horarioId);
        return ResponseEntity.noContent().build();
    }

    // Excepciones

    @GetMapping("/{id}/excepciones")
    public ResponseEntity<List<EstilistaExcepcion>> getExcepciones(@PathVariable Long id) {
        return ResponseEntity.ok(estilistaService.findExcepcionesByEstilista(id));
    }

    @PostMapping("/{id}/excepciones")
    public ResponseEntity<EstilistaExcepcion> addExcepcion(@PathVariable Long id,
                                                            @RequestBody EstilistaExcepcion excepcion) {
        excepcion.setEstilista(estilistaService.findById(id));
        return ResponseEntity.status(HttpStatus.CREATED).body(estilistaService.saveExcepcion(excepcion));
    }

    @DeleteMapping("/excepciones/{excepcionId}")
    public ResponseEntity<Void> deleteExcepcion(@PathVariable Long excepcionId) {
        estilistaService.deleteExcepcion(excepcionId);
        return ResponseEntity.noContent().build();
    }
}
