package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.DashboardStats;
import com.salonbelleza.app.repository.ClienteRepository;
import com.salonbelleza.app.repository.EstilistaRepository;
import com.salonbelleza.app.repository.ProductoRepository;
import com.salonbelleza.app.repository.ServicioRepository;
import com.salonbelleza.app.service.CitaService;
import com.salonbelleza.app.service.FacturaService;
import com.salonbelleza.app.service.InventarioService;
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
    private final ProductoRepository productoRepository;
    private final InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<DashboardStats> stats() {
        DashboardStats stats = DashboardStats.builder()
                .citasHoy(citaService.countCitasHoy())
                .citasCanceladasHoy(citaService.countCanceladasHoy())
                .citasPendientesFactura(citaService.completadasSinFactura().size())
                .clientesActivos(clienteRepository.countByEstado("Activo"))
                .clientesNuevosHoy(clienteRepository.countRegistradosEnFecha(java.time.LocalDate.now()))
                .clientesRecurrentes(clienteRepository.countClientesRecurrentes())
                .estilistaActivos(estilistaRepository.countByEstado("Activo"))
                .serviciosActivos(servicioRepository.countByEstado("Activo"))
                .productosActivos(productoRepository.countByEstado("Activo"))
                .stockBajo(inventarioService.findProductosBajoStock().size())
                .facturasPendientes(facturaService.countPendientes())
                .ingresosDia(facturaService.ingresosDelDia())
                .ingresosMesActual(facturaService.ingresosDelMes())
                .build();
        return ResponseEntity.ok(stats);
    }
}
