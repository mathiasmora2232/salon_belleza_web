package com.salonbelleza.app.controller;

import com.salonbelleza.app.entity.MovimientoInventario;
import com.salonbelleza.app.entity.Producto;
import com.salonbelleza.app.entity.Proveedor;
import com.salonbelleza.app.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    // --- Productos ---

    @GetMapping("/productos")
    public ResponseEntity<List<Producto>> getAllProductos() {
        return ResponseEntity.ok(inventarioService.findAllProductos());
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.findProductoById(id));
    }

    @GetMapping("/productos/bajo-stock")
    public ResponseEntity<List<Producto>> getProductosBajoStock() {
        return ResponseEntity.ok(inventarioService.findProductosBajoStock());
    }

    @GetMapping("/productos/categoria/{categoriaId}/estado/{estado}")
    public ResponseEntity<List<Producto>> getProductosByCategoriaAndEstado(@PathVariable Long categoriaId,
                                                                             @PathVariable String estado) {
        return ResponseEntity.ok(inventarioService.findProductosByCategoriaAndEstado(categoriaId, estado));
    }

    @PostMapping("/productos")
    public ResponseEntity<Producto> createProducto(@RequestBody Producto producto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioService.saveProducto(producto));
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<Producto> updateProducto(@PathVariable Long id, @RequestBody Producto producto) {
        return ResponseEntity.ok(inventarioService.updateProducto(id, producto));
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        inventarioService.deleteProducto(id);
        return ResponseEntity.noContent().build();
    }

    // --- Proveedores ---

    @GetMapping("/proveedores")
    public ResponseEntity<List<Proveedor>> getAllProveedores() {
        return ResponseEntity.ok(inventarioService.findAllProveedores());
    }

    @GetMapping("/proveedores/{id}")
    public ResponseEntity<Proveedor> getProveedorById(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.findProveedorById(id));
    }

    @PostMapping("/proveedores")
    public ResponseEntity<Proveedor> createProveedor(@RequestBody Proveedor proveedor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioService.saveProveedor(proveedor));
    }

    @PutMapping("/proveedores/{id}")
    public ResponseEntity<Proveedor> updateProveedor(@PathVariable Long id, @RequestBody Proveedor proveedor) {
        return ResponseEntity.ok(inventarioService.updateProveedor(id, proveedor));
    }

    @DeleteMapping("/proveedores/{id}")
    public ResponseEntity<Void> deleteProveedor(@PathVariable Long id) {
        inventarioService.deleteProveedor(id);
        return ResponseEntity.noContent().build();
    }

    // --- Movimientos ---

    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoInventario>> getAllMovimientos() {
        return ResponseEntity.ok(inventarioService.findAllMovimientos());
    }

    @GetMapping("/movimientos/producto/{productoId}")
    public ResponseEntity<List<MovimientoInventario>> getMovimientosByProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioService.findMovimientosByProducto(productoId));
    }

    @PostMapping("/movimientos")
    public ResponseEntity<MovimientoInventario> registrarMovimiento(@RequestBody MovimientoInventario movimiento) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioService.registrarMovimiento(movimiento));
    }
}
