package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.CajaVentaRequest;
import com.salonbelleza.app.entity.CajaMovimiento;
import com.salonbelleza.app.entity.CajaSesion;
import com.salonbelleza.app.entity.CajaVenta;
import com.salonbelleza.app.service.CajaService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/caja")
@RequiredArgsConstructor
public class CajaController {

    private final CajaService cajaService;

    @GetMapping("/actual")
    public ResponseEntity<CajaSesion> actual() {
        return ResponseEntity.ok(cajaService.cajaActual());
    }

    @PostMapping("/abrir")
    public ResponseEntity<CajaSesion> abrir(@RequestBody CajaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cajaService.abrir(req.getMontoInicial(), req.getObservaciones()));
    }

    @PostMapping("/{id}/cerrar")
    public ResponseEntity<CajaSesion> cerrar(@PathVariable Long id, @RequestBody CajaRequest req) {
        return ResponseEntity.ok(cajaService.cerrar(id, req.getEfectivoContado(), req.getObservaciones()));
    }

    @PostMapping("/{id}/movimientos")
    public ResponseEntity<CajaMovimiento> movimiento(@PathVariable Long id, @RequestBody MovimientoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cajaService.registrarMovimiento(id, req.getTipo(), req.getConcepto(), req.getMonto(), req.getMetodoPago(), req.getReferencia()));
    }

    @GetMapping("/{id}/movimientos")
    public ResponseEntity<List<CajaMovimiento>> movimientos(@PathVariable Long id) {
        return ResponseEntity.ok(cajaService.movimientos(id));
    }

    @GetMapping("/{id}/ventas")
    public ResponseEntity<List<CajaVenta>> ventas(@PathVariable Long id) {
        return ResponseEntity.ok(cajaService.ventasSesion(id));
    }

    @PostMapping("/ventas")
    public ResponseEntity<Map<String, Object>> registrarVenta(@RequestBody CajaVentaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cajaService.registrarVenta(req));
    }

    @GetMapping("/ventas/{id}")
    public ResponseEntity<Map<String, Object>> venta(@PathVariable Long id) {
        return ResponseEntity.ok(cajaService.ventaDetalle(id));
    }

    @GetMapping("/ventas/cliente/{clienteId}")
    public ResponseEntity<List<CajaVenta>> ventasCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(cajaService.ventasCliente(clienteId));
    }

    @Data
    static class CajaRequest {
        private BigDecimal montoInicial;
        private BigDecimal efectivoContado;
        private String observaciones;
    }

    @Data
    static class MovimientoRequest {
        private String tipo;
        private String concepto;
        private String metodoPago;
        private BigDecimal monto;
        private String referencia;
    }
}
