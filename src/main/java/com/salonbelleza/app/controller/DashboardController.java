package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.DashboardStats;
import com.salonbelleza.app.repository.ClienteRepository;
import com.salonbelleza.app.repository.EstilistaRepository;
import com.salonbelleza.app.repository.ServicioRepository;
import com.salonbelleza.app.service.CitaService;
import com.salonbelleza.app.service.FacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final CitaService citaService;
    private final FacturaService facturaService;
    private final ClienteRepository clienteRepository;
    private final EstilistaRepository estilistaRepository;
    private final ServicioRepository servicioRepository;

    @GetMapping
    public ResponseEntity<DashboardStats> stats() {
        DashboardStats stats = DashboardStats.builder()
                .citasHoy(citaService.countCitasHoy())
                .citasPendientesFactura(citaService.completadasSinFactura().size())
                .clientesActivos(clienteRepository.countByEstado("Activo"))
                .estilistaActivos(estilistaRepository.countByEstado("Activo"))
                .serviciosActivos(servicioRepository.countByEstado("Activo"))
                .facturasPendientes(facturaService.countPendientes())
                .ingresosMesActual(facturaService.ingresosDelMes())
                .build();
        return ResponseEntity.ok(stats);
    }
}
