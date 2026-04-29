package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.Cita;
import com.salonbelleza.app.entity.CitaServicio;
import com.salonbelleza.app.entity.Factura;
import com.salonbelleza.app.entity.FacturaItem;
import com.salonbelleza.app.entity.FacturaPago;
import com.salonbelleza.app.entity.MetodoPago;
import com.salonbelleza.app.repository.CitaRepository;
import com.salonbelleza.app.repository.CitaServicioRepository;
import com.salonbelleza.app.repository.FacturaItemRepository;
import com.salonbelleza.app.repository.FacturaPagoRepository;
import com.salonbelleza.app.repository.FacturaRepository;
import com.salonbelleza.app.repository.MetodoPagoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final FacturaItemRepository itemRepository;
    private final FacturaPagoRepository pagoRepository;
    private final CitaRepository citaRepository;
    private final CitaServicioRepository citaServicioRepository;
    private final MetodoPagoRepository metodoPagoRepository;

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

    // --- Dashboard / Business Logic ---

    @Transactional(readOnly = true)
    public BigDecimal ingresosDelMes() {
        YearMonth now = YearMonth.now();
        BigDecimal result = facturaRepository.sumIngresosDelMesNative(now.getYear(), now.getMonthValue());
        return result != null ? result : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public BigDecimal ingresosDelDia() {
        BigDecimal result = facturaRepository.sumIngresosDiaNative();
        return result != null ? result : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public long countPendientes() {
        return facturaRepository.countByEstado("PENDIENTE");
    }

    public Factura crearDesdeCita(Long citaId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + citaId));

        if (facturaRepository.findByCitaId(citaId).isPresent()) {
            throw new IllegalStateException("Ya existe una factura para la cita id: " + citaId);
        }

        List<CitaServicio> servicios = citaServicioRepository.findByCitaId(citaId);
        BigDecimal subtotal = servicios.stream()
                .map(cs -> cs.getPrecioAplicado() != null ? cs.getPrecioAplicado() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String numero = "F-" + System.currentTimeMillis();

        Factura factura = Factura.builder()
                .numero(numero)
                .cita(cita)
                .cliente(cita.getCliente())
                .fecha(OffsetDateTime.now())
                .subtotal(subtotal)
                .descuento(BigDecimal.ZERO)
                .impuestoMonto(BigDecimal.ZERO)
                .total(subtotal)
                .pagado(BigDecimal.ZERO)
                .estado("PENDIENTE")
                .build();

        Factura saved = facturaRepository.save(factura);

        for (CitaServicio cs : servicios) {
            FacturaItem item = FacturaItem.builder()
                    .factura(saved)
                    .servicio(cs.getServicio())
                    .descripcion(cs.getServicio() != null ? cs.getServicio().getNombre() : "Servicio")
                    .cantidad(BigDecimal.ONE)
                    .precioUnitario(cs.getPrecioAplicado() != null ? cs.getPrecioAplicado() : BigDecimal.ZERO)
                    .subtotal(cs.getPrecioAplicado() != null ? cs.getPrecioAplicado() : BigDecimal.ZERO)
                    .build();
            itemRepository.save(item);
        }

        return saved;
    }

    public Factura registrarPago(Long facturaId, String codigoMetodoPago, BigDecimal monto, String referencia) {
        Factura factura = findById(facturaId);

        MetodoPago metodo = metodoPagoRepository.findByCodigo(codigoMetodoPago)
                .orElseThrow(() -> new EntityNotFoundException("Método de pago no encontrado: " + codigoMetodoPago));

        FacturaPago pago = FacturaPago.builder()
                .factura(factura)
                .metodoPago(metodo)
                .monto(monto)
                .referencia(referencia)
                .fecha(OffsetDateTime.now())
                .build();
        pagoRepository.save(pago);

        BigDecimal pagadoActual = factura.getPagado() != null ? factura.getPagado() : BigDecimal.ZERO;
        BigDecimal nuevoPagado = pagadoActual.add(monto);
        factura.setPagado(nuevoPagado);

        if (nuevoPagado.compareTo(factura.getTotal()) >= 0) {
            factura.setEstado("PAGADA");
        }

        return facturaRepository.save(factura);
    }
}
