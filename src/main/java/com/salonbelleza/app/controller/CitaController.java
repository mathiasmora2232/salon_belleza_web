package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.ReservaPublicaRequest;
import com.salonbelleza.app.entity.Cita;
import com.salonbelleza.app.entity.CitaEstado;
import com.salonbelleza.app.entity.CitaHistorial;
import com.salonbelleza.app.entity.CitaServicio;
import com.salonbelleza.app.service.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/citas")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    @GetMapping
    public ResponseEntity<List<Cita>> getAll() {
        return ResponseEntity.ok(citaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> getById(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.findById(id));
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<Cita>> getByFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(citaService.findByFecha(fecha));
    }

    @GetMapping("/estilista/{estilistaId}/fecha/{fecha}")
    public ResponseEntity<List<Cita>> getByEstilistaAndFecha(
            @PathVariable Long estilistaId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(citaService.findByFechaAndEstilista(fecha, estilistaId));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Cita>> getByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(citaService.findByCliente(clienteId));
    }

    @GetMapping("/rango")
    public ResponseEntity<List<Cita>> getByRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(citaService.findByFechaBetween(inicio, fin));
    }

    @PostMapping("/publica")
    public ResponseEntity<Cita> reservarPublica(@RequestBody ReservaPublicaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.reservarPublica(request));
    }

    @PostMapping
    public ResponseEntity<Cita> create(@RequestBody Cita cita) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.save(cita));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cita> update(@PathVariable Long id, @RequestBody Cita cita) {
        return ResponseEntity.ok(citaService.update(id, cita));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        citaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Servicios de cita

    @GetMapping("/{id}/servicios")
    public ResponseEntity<List<CitaServicio>> getServicios(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.findServiciosByCita(id));
    }

    @PostMapping("/{id}/servicios")
    public ResponseEntity<CitaServicio> addServicio(@PathVariable Long id,
                                                     @RequestBody CitaServicio citaServicio) {
        citaServicio.setCita(citaService.findById(id));
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.saveCitaServicio(citaServicio));
    }

    @DeleteMapping("/servicios/{citaServicioId}")
    public ResponseEntity<Void> deleteServicio(@PathVariable Long citaServicioId) {
        citaService.deleteCitaServicio(citaServicioId);
        return ResponseEntity.noContent().build();
    }

    // Historial

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<CitaHistorial>> getHistorial(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.findHistorialByCita(id));
    }

    @PostMapping("/{id}/historial")
    public ResponseEntity<CitaHistorial> addHistorial(@PathVariable Long id,
                                                       @RequestBody CitaHistorial historial) {
        historial.setCita(citaService.findById(id));
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.registrarCambioEstado(historial));
    }

    // Estados

    @GetMapping("/estados")
    public ResponseEntity<List<CitaEstado>> getAllEstados() {
        return ResponseEntity.ok(citaService.findAllEstados());
    }

    @PostMapping("/estados")
    public ResponseEntity<CitaEstado> createEstado(@RequestBody CitaEstado estado) {
        return ResponseEntity.status(HttpStatus.CREATED).body(citaService.saveEstado(estado));
    }

    // Workflow endpoints

    @GetMapping("/hoy")
    public ResponseEntity<List<Cita>> getCitasHoy() {
        return ResponseEntity.ok(citaService.citasHoy());
    }

    @GetMapping("/completadas-sin-factura")
    public ResponseEntity<List<Cita>> getCompletadasSinFactura() {
        return ResponseEntity.ok(citaService.completadasSinFactura());
    }

    @PatchMapping("/{id}/estado/{codigo}")
    public ResponseEntity<Cita> cambiarEstado(@PathVariable Long id, @PathVariable String codigo) {
        return ResponseEntity.ok(citaService.cambiarEstado(id, codigo));
    }
}
