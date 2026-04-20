package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.MovimientoInventario;
import com.salonbelleza.app.entity.Producto;
import com.salonbelleza.app.entity.Proveedor;
import com.salonbelleza.app.repository.MovimientoInventarioRepository;
import com.salonbelleza.app.repository.ProductoRepository;
import com.salonbelleza.app.repository.ProveedorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class InventarioService {

    private final ProductoRepository productoRepository;
    private final ProveedorRepository proveedorRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    // --- Productos ---

    @Transactional(readOnly = true)
    public List<Producto> findAllProductos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Producto findProductoById(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Producto> findProductosByCategoriaAndEstado(Long categoriaId, String estado) {
        return productoRepository.findByCategoriaIdAndEstado(categoriaId, estado);
    }

    @Transactional(readOnly = true)
    public List<Producto> findProductosBajoStock() {
        return productoRepository.findProductosBajoStockMinimo();
    }

    public Producto saveProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto updateProducto(Long id, Producto updated) {
        Producto existente = findProductoById(id);
        existente.setNombre(updated.getNombre());
        existente.setDescripcion(updated.getDescripcion());
        existente.setMarca(updated.getMarca());
        existente.setPrecioCompra(updated.getPrecioCompra());
        existente.setPrecioVenta(updated.getPrecioVenta());
        existente.setStockMinimo(updated.getStockMinimo());
        existente.setEstado(updated.getEstado());
        existente.setCategoria(updated.getCategoria());
        existente.setProveedor(updated.getProveedor());
        return productoRepository.save(existente);
    }

    public void deleteProducto(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new EntityNotFoundException("Producto no encontrado con id: " + id);
        }
        productoRepository.deleteById(id);
    }

    // --- Proveedores ---

    @Transactional(readOnly = true)
    public List<Proveedor> findAllProveedores() {
        return proveedorRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Proveedor findProveedorById(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proveedor no encontrado con id: " + id));
    }

    public Proveedor saveProveedor(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    public Proveedor updateProveedor(Long id, Proveedor updated) {
        Proveedor existente = findProveedorById(id);
        existente.setNombre(updated.getNombre());
        existente.setContacto(updated.getContacto());
        existente.setTelefono(updated.getTelefono());
        existente.setEmail(updated.getEmail());
        existente.setDireccion(updated.getDireccion());
        existente.setActivo(updated.getActivo());
        return proveedorRepository.save(existente);
    }

    public void deleteProveedor(Long id) {
        if (!proveedorRepository.existsById(id)) {
            throw new EntityNotFoundException("Proveedor no encontrado con id: " + id);
        }
        proveedorRepository.deleteById(id);
    }

    // --- Movimientos ---

    @Transactional(readOnly = true)
    public List<MovimientoInventario> findAllMovimientos() {
        return movimientoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<MovimientoInventario> findMovimientosByProducto(Long productoId) {
        return movimientoRepository.findByProductoId(productoId);
    }

    public MovimientoInventario registrarMovimiento(MovimientoInventario movimiento) {
        return movimientoRepository.save(movimiento);
    }
}
