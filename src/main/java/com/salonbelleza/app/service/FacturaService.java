package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.Factura;
import com.salonbelleza.app.entity.FacturaItem;
import com.salonbelleza.app.entity.FacturaPago;
import com.salonbelleza.app.repository.FacturaItemRepository;
import com.salonbelleza.app.repository.FacturaPagoRepository;
import com.salonbelleza.app.repository.FacturaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final FacturaItemRepository itemRepository;
    private final FacturaPagoRepository pagoRepository;

    // --- Facturas ---

    @Transactional(readOnly = true)
    public List<Factura> findAll() {
        return facturaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Factura findById(Long id) {
        return facturaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura no encontrada con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Factura> findByCliente(Long clienteId) {
        return facturaRepository.findByClienteId(clienteId);
    }

    @Transactional(readOnly = true)
    public List<Factura> findByEstado(String estado) {
        return facturaRepository.findByEstado(estado);
    }

    @Transactional(readOnly = true)
    public Factura findByCita(Long citaId) {
        return facturaRepository.findByCitaId(citaId)
                .orElseThrow(() -> new EntityNotFoundException("Factura no encontrada para citaId: " + citaId));
    }

    public Factura save(Factura factura) {
        return facturaRepository.save(factura);
    }

    public Factura update(Long id, Factura updated) {
        Factura existente = findById(id);
        existente.setEstado(updated.getEstado());
        existente.setDescuento(updated.getDescuento());
        existente.setObservaciones(updated.getObservaciones());
        existente.setSubtotal(updated.getSubtotal());
        existente.setImpuestoMonto(updated.getImpuestoMonto());
        existente.setTotal(updated.getTotal());
        return facturaRepository.save(existente);
    }

    public void delete(Long id) {
        if (!facturaRepository.existsById(id)) {
            throw new EntityNotFoundException("Factura no encontrada con id: " + id);
        }
        facturaRepository.deleteById(id);
    }

    // --- Factura Items ---

    @Transactional(readOnly = true)
    public List<FacturaItem> findItemsByFactura(Long facturaId) {
        return itemRepository.findByFacturaId(facturaId);
    }

    public FacturaItem saveItem(FacturaItem item) {
        return itemRepository.save(item);
    }

    public void deleteItem(Long itemId) {
        itemRepository.deleteById(itemId);
    }

    // --- Factura Pagos ---

    @Transactional(readOnly = true)
    public List<FacturaPago> findPagosByFactura(Long facturaId) {
        return pagoRepository.findByFacturaId(facturaId);
    }

    public FacturaPago savePago(FacturaPago pago) {
        return pagoRepository.save(pago);
    }

    public void deletePago(Long pagoId) {
        pagoRepository.deleteById(pagoId);
    }
}
