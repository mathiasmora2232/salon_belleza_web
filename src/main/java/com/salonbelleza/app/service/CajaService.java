package com.salonbelleza.app.service;

import com.salonbelleza.app.dto.CajaVentaRequest;
import com.salonbelleza.app.entity.*;
import com.salonbelleza.app.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class CajaService {

    private final CajaSesionRepository sesionRepository;
    private final CajaMovimientoRepository movimientoRepository;
    private final CajaVentaRepository ventaRepository;
    private final CajaVentaItemRepository itemRepository;
    private final CajaVentaPagoRepository pagoRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;

    public CajaSesion abrir(BigDecimal montoInicial, String observaciones) {
        sesionRepository.findFirstByEstadoOrderByAbiertaEnDesc("ABIERTA").ifPresent(s -> {
            throw new IllegalStateException("Ya existe una caja abierta: " + s.getCodigo());
        });

        CajaSesion sesion = CajaSesion.builder()
                .codigo("CJ-" + System.currentTimeMillis())
                .estado("ABIERTA")
                .abiertaEn(OffsetDateTime.now())
                .montoInicial(nz(montoInicial))
                .efectivoEsperado(nz(montoInicial))
                .efectivoContado(BigDecimal.ZERO)
                .diferencia(BigDecimal.ZERO)
                .observaciones(observaciones)
                .build();
        return sesionRepository.save(sesion);
    }

    @Transactional(readOnly = true)
    public CajaSesion cajaActual() {
        return sesionRepository.findFirstByEstadoOrderByAbiertaEnDesc("ABIERTA").orElse(null);
    }

    public CajaSesion cerrar(Long sesionId, BigDecimal efectivoContado, String observaciones) {
        CajaSesion sesion = findSesion(sesionId);
        if (!"ABIERTA".equals(sesion.getEstado())) {
            throw new IllegalStateException("La caja no está abierta");
        }

        BigDecimal contado = nz(efectivoContado);
        sesion.setEfectivoContado(contado);
        sesion.setDiferencia(contado.subtract(nz(sesion.getEfectivoEsperado())));
        sesion.setEstado("CERRADA");
        sesion.setCerradaEn(OffsetDateTime.now());
        sesion.setObservaciones(observaciones);
        return sesionRepository.save(sesion);
    }

    public CajaMovimiento registrarMovimiento(Long sesionId, String tipo, String concepto, BigDecimal monto, String metodoPago, String referencia) {
        CajaSesion sesion = findSesion(sesionId);
        CajaMovimiento mov = CajaMovimiento.builder()
                .cajaSesion(sesion)
                .tipo(tipo)
                .concepto(concepto)
                .metodoPago(metodoPago)
                .monto(nz(monto))
                .referencia(referencia)
                .createdAt(OffsetDateTime.now())
                .build();

        if ("EFECTIVO".equalsIgnoreCase(metodoPago)) {
            BigDecimal esperado = nz(sesion.getEfectivoEsperado());
            BigDecimal signed = "EGRESO".equalsIgnoreCase(tipo) ? nz(monto).negate() : nz(monto);
            sesion.setEfectivoEsperado(esperado.add(signed));
            sesionRepository.save(sesion);
        }

        return movimientoRepository.save(mov);
    }

    public Map<String, Object> registrarVenta(CajaVentaRequest req) {
        CajaSesion sesion = cajaActual();
        if (sesion == null) throw new IllegalStateException("Primero abre caja para registrar ventas");
        if (req.getItems() == null || req.getItems().isEmpty()) throw new IllegalArgumentException("La venta necesita items");

        Cliente cliente = req.getClienteId() != null
                ? clienteRepository.findById(req.getClienteId()).orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado"))
                : null;

        BigDecimal subtotal = req.getItems().stream()
                .map(i -> nz(i.getCantidad()).multiply(nz(i.getPrecioUnitario())).subtract(nz(i.getDescuento())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = subtotal.subtract(nz(req.getDescuento()));
        BigDecimal pagado = req.getPagos().stream().map(p -> nz(p.getMonto())).reduce(BigDecimal.ZERO, BigDecimal::add);

        if (pagado.compareTo(total) < 0) {
            throw new IllegalArgumentException("El pago no cubre el total de la venta");
        }

        CajaVenta venta = ventaRepository.save(CajaVenta.builder()
                .numero("PV-" + System.currentTimeMillis())
                .cajaSesion(sesion)
                .cliente(cliente)
                .fecha(OffsetDateTime.now())
                .subtotal(subtotal)
                .descuento(nz(req.getDescuento()))
                .total(total)
                .estado("PAGADA")
                .observaciones(req.getObservaciones())
                .build());

        for (CajaVentaRequest.Item i : req.getItems()) {
            BigDecimal itemSubtotal = nz(i.getCantidad()).multiply(nz(i.getPrecioUnitario())).subtract(nz(i.getDescuento()));
            itemRepository.save(CajaVentaItem.builder()
                    .venta(venta)
                    .tipo(i.getTipo())
                    .referenciaId(i.getReferenciaId())
                    .descripcion(i.getDescripcion())
                    .cantidad(nz(i.getCantidad()))
                    .precioUnitario(nz(i.getPrecioUnitario()))
                    .descuento(nz(i.getDescuento()))
                    .subtotal(itemSubtotal)
                    .build());

            if ("PRODUCTO".equalsIgnoreCase(i.getTipo()) && i.getReferenciaId() != null) {
                Producto p = productoRepository.findById(i.getReferenciaId()).orElse(null);
                if (p != null) {
                    p.setStockActual(nz(p.getStockActual()).subtract(nz(i.getCantidad())));
                    productoRepository.save(p);
                }
            }
        }

        for (CajaVentaRequest.Pago p : req.getPagos()) {
            pagoRepository.save(CajaVentaPago.builder()
                    .venta(venta)
                    .metodo(p.getMetodo())
                    .monto(nz(p.getMonto()))
                    .referencia(p.getReferencia())
                    .build());
            registrarMovimiento(sesion.getId(), "VENTA", "Venta " + venta.getNumero(), p.getMonto(), p.getMetodo(), p.getReferencia());
        }

        return ventaDetalle(venta.getId());
    }

    @Transactional(readOnly = true)
    public List<CajaMovimiento> movimientos(Long sesionId) {
        return movimientoRepository.findByCajaSesionIdOrderByCreatedAtDesc(sesionId);
    }

    @Transactional(readOnly = true)
    public List<CajaVenta> ventasSesion(Long sesionId) {
        return ventaRepository.findByCajaSesionIdOrderByFechaDesc(sesionId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> ventaDetalle(Long ventaId) {
        CajaVenta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada"));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("venta", venta);
        data.put("items", itemRepository.findByVentaId(ventaId));
        data.put("pagos", pagoRepository.findByVentaId(ventaId));
        return data;
    }

    @Transactional(readOnly = true)
    public List<CajaVenta> ventasCliente(Long clienteId) {
        return ventaRepository.findByClienteIdOrderByFechaDesc(clienteId);
    }

    private CajaSesion findSesion(Long id) {
        return sesionRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Caja no encontrada"));
    }

    private BigDecimal nz(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
