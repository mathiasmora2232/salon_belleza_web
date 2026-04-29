package com.salonbelleza.app.service;

import com.salonbelleza.app.dto.ReservaPublicaRequest;
import com.salonbelleza.app.entity.*;
import com.salonbelleza.app.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final CitaServicioRepository citaServicioRepository;
    private final CitaHistorialRepository citaHistorialRepository;
    private final CitaEstadoRepository citaEstadoRepository;
    private final ClienteRepository clienteRepository;
    private final EstilistaRepository estilistaRepository;
    private final ServicioRepository servicioRepository;

    // --- Citas ---

    @Transactional(readOnly = true)
    public List<Cita> findAll() {
        return citaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Cita findById(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cita no encontrada con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Cita> findByFecha(LocalDate fecha) {
        return citaRepository.findByFecha(fecha);
    }

    @Transactional(readOnly = true)
    public List<Cita> findByFechaAndEstilista(LocalDate fecha, Long estilistaId) {
        return citaRepository.findByFechaAndEstilistaId(fecha, estilistaId);
    }

    @Transactional(readOnly = true)
    public List<Cita> findByCliente(Long clienteId) {
        return citaRepository.findByClienteId(clienteId);
    }

    @Transactional(readOnly = true)
    public List<Cita> findByFechaBetween(LocalDate inicio, LocalDate fin) {
        return citaRepository.findByFechaBetween(inicio, fin);
    }

    public Cita save(Cita cita) {
        return citaRepository.save(cita);
    }

    public Cita update(Long id, Cita updated) {
        Cita existente = findById(id);
        existente.setFecha(updated.getFecha());
        existente.setHoraInicio(updated.getHoraInicio());
        existente.setHoraFin(updated.getHoraFin());
        existente.setObservaciones(updated.getObservaciones());
        existente.setEstilista(updated.getEstilista());
        existente.setCliente(updated.getCliente());
        return citaRepository.save(existente);
    }

    public void delete(Long id) {
        if (!citaRepository.existsById(id)) {
            throw new EntityNotFoundException("Cita no encontrada con id: " + id);
        }
        citaRepository.deleteById(id);
    }

    // --- Cita Servicios ---

    @Transactional(readOnly = true)
    public List<CitaServicio> findServiciosByCita(Long citaId) {
        return citaServicioRepository.findByCitaId(citaId);
    }

    public CitaServicio saveCitaServicio(CitaServicio citaServicio) {
        return citaServicioRepository.save(citaServicio);
    }

    public void deleteCitaServicio(Long citaServicioId) {
        citaServicioRepository.deleteById(citaServicioId);
    }

    // --- Cita Historial ---

    @Transactional(readOnly = true)
    public List<CitaHistorial> findHistorialByCita(Long citaId) {
        return citaHistorialRepository.findByCitaIdOrderByCreatedAtAsc(citaId);
    }

    public CitaHistorial registrarCambioEstado(CitaHistorial historial) {
        return citaHistorialRepository.save(historial);
    }

    // --- Cita Estados ---

    @Transactional(readOnly = true)
    public List<CitaEstado> findAllEstados() {
        return citaEstadoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CitaEstado findEstadoById(Long id) {
        return citaEstadoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Estado no encontrado con id: " + id));
    }

    public CitaEstado saveEstado(CitaEstado estado) {
        return citaEstadoRepository.save(estado);
    }

    // --- Dashboard / Business Logic ---

    @Transactional(readOnly = true)
    public long countCitasHoy() {
        return citaRepository.countByFecha(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<Cita> citasHoy() {
        return citaRepository.findByFechaOrderByHoraInicio(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<Cita> completadasSinFactura() {
        return citaRepository.findCompletadasSinFactura();
    }

    public Cita reservarPublica(ReservaPublicaRequest req) {
        Cliente cliente = clienteRepository.findByTelefono(req.getTelefono())
                .orElseGet(() -> {
                    OffsetDateTime now = OffsetDateTime.now();
                    Cliente nuevo = new Cliente();
                    nuevo.setTipoIdentificacion("CEDULA");
                    nuevo.setNumeroIdentificacion("PUB" + System.currentTimeMillis());
                    nuevo.setNombre(req.getNombre());
                    nuevo.setApellido(req.getApellido() != null ? req.getApellido() : "");
                    nuevo.setTelefono(req.getTelefono());
                    nuevo.setEmail(req.getEmail());
                    nuevo.setEstado("Activo");
                    nuevo.setFechaRegistro(now);
                    nuevo.setCreatedAt(now);
                    nuevo.setUpdatedAt(now);
                    return clienteRepository.save(nuevo);
                });

        Servicio servicio = servicioRepository.findById(req.getServicioId())
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado"));

        Estilista estilista = req.getEstilistaId() != null
                ? estilistaRepository.findById(req.getEstilistaId()).orElse(null)
                : null;

        CitaEstado estadoPendiente = citaEstadoRepository.findByCodigo("PENDIENTE")
                .orElseGet(() -> {
                    CitaEstado e = new CitaEstado();
                    e.setCodigo("PENDIENTE");
                    e.setNombre("Pendiente");
                    e.setColorHex("#f59e0b");
                    e.setEsFinal(false);
                    e.setOrden((short) 1);
                    return citaEstadoRepository.save(e);
                });

        Cita cita = new Cita();
        cita.setCliente(cliente);
        cita.setEstilista(estilista);
        cita.setEstado(estadoPendiente);
        cita.setFecha(req.getFecha());
        cita.setHoraInicio(req.getHoraInicio());
        cita.setHoraFin(req.getHoraInicio().plusMinutes(servicio.getDuracionMin()));
        cita.setObservaciones(req.getObservaciones());
        cita.setCreatedAt(OffsetDateTime.now());
        cita.setUpdatedAt(OffsetDateTime.now());
        cita = citaRepository.save(cita);

        CitaServicio citaServicio = new CitaServicio();
        citaServicio.setCita(cita);
        citaServicio.setServicio(servicio);
        citaServicio.setEstilista(estilista);
        citaServicio.setPrecioAplicado(servicio.getPrecio());
        citaServicio.setDuracionAplicada(servicio.getDuracionMin());
        citaServicio.setOrden((short) 1);
        citaServicioRepository.save(citaServicio);

        return cita;
    }

    public Cita cambiarEstado(Long citaId, String codigoEstado) {
        Cita cita = findById(citaId);
        CitaEstado nuevoEstado = citaEstadoRepository.findByCodigo(codigoEstado)
                .orElseThrow(() -> new EntityNotFoundException("Estado no encontrado: " + codigoEstado));
        cita.setEstado(nuevoEstado);
        return citaRepository.save(cita);
    }
}
