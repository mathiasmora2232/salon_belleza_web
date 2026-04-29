package com.salonbelleza.app.controller;

import com.salonbelleza.app.entity.ReporteEvento;
import com.salonbelleza.app.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    /** Genera (o regenera) el PDF para una cita de evento grupal y lo devuelve. */
    @PostMapping("/evento/{citaId}")
    public ResponseEntity<byte[]> generar(@PathVariable Long citaId) {
        byte[] pdf = reporteService.generarReporteEvento(citaId);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"evento_" + citaId + ".pdf\"")
            .body(pdf);
    }

    /** Devuelve el PDF guardado si ya existe. */
    @GetMapping("/evento/{citaId}")
    public ResponseEntity<?> ver(@PathVariable Long citaId) {
        Optional<ReporteEvento> opt = reporteService.getReporte(citaId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "No hay reporte generado para esta cita."));
        }
        ReporteEvento r = opt.get();
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + r.getNombreArchivo() + "\"")
            .body(r.getPdfData());
    }

    /** Indica si ya existe un reporte guardado para la cita. */
    @GetMapping("/evento/{citaId}/existe")
    public ResponseEntity<Map<String, Object>> existe(@PathVariable Long citaId) {
        boolean existe = reporteService.existeReporte(citaId);
        return ResponseEntity.ok(Map.of("existe", existe, "citaId", citaId));
    }
}
