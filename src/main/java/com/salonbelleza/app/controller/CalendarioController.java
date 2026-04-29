package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.CitaCalendarioDto;
import com.salonbelleza.app.dto.SlotDto;
import com.salonbelleza.app.service.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calendario")
@RequiredArgsConstructor
public class CalendarioController {

    private final CitaService citaService;

    @GetMapping
    public ResponseEntity<List<CitaCalendarioDto>> getCitas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(citaService.getCitasCalendario(inicio, fin));
    }

    @GetMapping("/slots")
    public ResponseEntity<List<SlotDto>> getSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(citaService.getSlotsDisponibilidad(fecha));
    }
}
