package com.salonbelleza.app.controller;

import com.salonbelleza.app.entity.Factura;
import com.salonbelleza.app.entity.FacturaItem;
import com.salonbelleza.app.entity.FacturaPago;
import com.salonbelleza.app.service.FacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;

    @GetMapping
    public ResponseEntity<List<Factura>> getAll() {
        return ResponseEntity.ok(facturaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Factura> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.findById(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Factura>> getByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(facturaService.findByCliente(clienteId));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Factura>> getByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(facturaService.findByEstado(estado));
    }

    @GetMapping("/cita/{citaId}")
    public ResponseEntity<Factura> getByCita(@PathVariable Long citaId) {
        return ResponseEntity.ok(facturaService.findByCita(citaId));
    }

    @PostMapping
    public ResponseEntity<Factura> create(@RequestBody Factura factura) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.save(factura));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Factura> update(@PathVariable Long id, @RequestBody Factura factura) {
        return ResponseEntity.ok(facturaService.update(id, factura));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facturaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Items

    @GetMapping("/{id}/items")
    public ResponseEntity<List<FacturaItem>> getItems(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.findItemsByFactura(id));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<FacturaItem> addItem(@PathVariable Long id, @RequestBody FacturaItem item) {
        item.setFactura(facturaService.findById(id));
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.saveItem(item));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        facturaService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // Pagos

    @GetMapping("/{id}/pagos")
    public ResponseEntity<List<FacturaPago>> getPagos(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.findPagosByFactura(id));
    }

    @PostMapping("/{id}/pagos")
    public ResponseEntity<FacturaPago> addPago(@PathVariable Long id, @RequestBody FacturaPago pago) {
        pago.setFactura(facturaService.findById(id));
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaService.savePago(pago));
    }

    @DeleteMapping("/pagos/{pagoId}")
    public ResponseEntity<Void> deletePago(@PathVariable Long pagoId) {
        facturaService.deletePago(pagoId);
        return ResponseEntity.noContent().build();
    }
}
