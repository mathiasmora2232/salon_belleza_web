package com.salonbelleza.app.service;

import com.salonbelleza.app.dto.CitaCalendarioDto;
import com.salonbelleza.app.dto.ReservaPublicaRequest;
import com.salonbelleza.app.dto.SlotDto;
import com.salonbelleza.app.entity.*;
import com.salonbelleza.app.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
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

    private static final List<String> ESTADOS_CANCELADOS = List.of("CAN", "NAS", "CANCELADA", "CANCELADO");
    static final LocalTime HORA_APERTURA  = LocalTime.of(8, 0);
    static final LocalTime HORA_CIERRE    = LocalTime.of(20, 0);

    public void validarDisponibilidad(LocalDate fecha, LocalTime horaInicio, LocalTime horaFin,
                                      Long estilistaId, Long citaIdExcluir) {
        if (horaInicio == null || horaFin == null || fecha == null) return;

        int min = horaInicio.getMinute();
        if (min != 0 && min != 30)
            throw new IllegalArgumentException("La hora de inicio debe ser en punto (:00) o y media (:30)");

        long totalEstilistas = estilistaRepository.countByEstado("Activo");
        if (totalEstilistas == 0)
            throw new IllegalStateException("No hay estilistas activos registrados");

        long ocupados = citaRepository.countOverlapping(fecha, horaInicio, horaFin, ESTADOS_CANCELADOS);
        if (citaIdExcluir != null) {
            Cita actual = citaRepository.findById(citaIdExcluir).orElse(null);
            if (actual != null && actual.getFecha().equals(fecha)
                    && actual.getHoraInicio() != null && actual.getHoraFin() != null
                    && actual.getHoraInicio().isBefore(horaFin)
                    && actual.getHoraFin().isAfter(horaInicio)
                    && (actual.getEstado() == null || !ESTADOS_CANCELADOS.contains(actual.getEstado().getCodigo()))) {
                ocupados = Math.max(0, ocupados - 1);
            }
        }
        if (ocupados >= totalEstilistas)
            throw new IllegalStateException(
                "Horario lleno. Capacidad máxima: " + totalEstilistas + " estilista(s) simultáneo(s)");

        if (estilistaId != null) {
            boolean conflicto = citaRepository.existsConflictoEstilista(
                estilistaId, fecha, horaInicio, horaFin, ESTADOS_CANCELADOS);
            if (conflicto)
                throw new IllegalStateException("El estilista ya tiene una cita en ese horario");
        }
    }

    @Transactional(readOnly = true)
    public List<SlotDto> getSlotsDisponibilidad(LocalDate fecha) {
        long capacidad = estilistaRepository.countByEstado("Activo");
        if (capacidad == 0) capacidad = 1;

        List<SlotDto> slots = new ArrayList<>();
        LocalTime hora = HORA_APERTURA;
        while (hora.isBefore(HORA_CIERRE)) {
            LocalTime siguiente = hora.plusMinutes(30);
            long ocupados = citaRepository.countOverlapping(fecha, hora, siguiente, ESTADOS_CANCELADOS);
            int cap = (int) capacidad;
            int ocu = (int) Math.min(ocupados, cap);
            slots.add(new SlotDto(hora, cap, ocu, cap - ocu, ocu >= cap));
            hora = siguiente;
        }
        return slots;
    }

    @Transactional(readOnly = true)
    public List<CitaCalendarioDto> getCitasCalendario(LocalDate inicio, LocalDate fin) {
        return citaRepository.findByFechaBetweenWithDetails(inicio, fin).stream()
            .map(c -> new CitaCalendarioDto(
                c.getId(),
                c.getCliente() != null
                    ? (c.getCliente().getNombre() + " " +
                       (c.getCliente().getApellido() != null ? c.getCliente().getApellido() : "")).trim()
                    : "—",
                c.getCliente() != null ? c.getCliente().getTelefono() : null,
                c.getEstilista() != null ? c.getEstilista().getNombre() : null,
                c.getFecha(),
                c.getHoraInicio(),
                c.getHoraFin(),
                c.getEstado() != null ? c.getEstado().getCodigo() : null,
                c.getEstado() != null ? c.getEstado().getNombre() : "Pendiente",
                c.getEstado() != null ? c.getEstado().getColorHex() : "#f59e0b",
                c.getObservaciones() != null && c.getObservaciones().contains("Evento grupal:")
            ))
            .toList();
    }

    public Cita save(Cita cita) {
        if (cita.getFecha() != null && cita.getHoraInicio() != null) {
            Long estilistaId = cita.getEstilista() != null ? cita.getEstilista().getId() : null;
            validarDisponibilidad(cita.getFecha(), cita.getHoraInicio(), cita.getHoraFin(), estilistaId, cita.getId());
        }
        return citaRepository.save(cita);
    }

    public Cita update(Long id, Cita updated) {
        Cita existente = findById(id);
        if (updated.getFecha() != null && updated.getHoraInicio() != null) {
            Long estilistaId = updated.getEstilista() != null ? updated.getEstilista().getId() : null;
            validarDisponibilidad(updated.getFecha(), updated.getHoraInicio(), updated.getHoraFin(), estilistaId, id);
        }
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
    public long countCanceladasHoy() {
        return citaRepository.countByFechaAndEstadoCodigoIn(LocalDate.now(), List.of("CAN", "NAS", "CANCELADA", "CANCELADO"));
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
        LocalTime horaFin = req.getHoraInicio().plusMinutes(servicio.getDuracionMin());
        validarDisponibilidad(req.getFecha(), req.getHoraInicio(), horaFin,
            req.getEstilistaId(), null);

        cita.setCliente(cliente);
        cita.setEstilista(estilista);
        cita.setEstado(estadoPendiente);
        cita.setFecha(req.getFecha());
        cita.setHoraInicio(req.getHoraInicio());
        cita.setHoraFin(horaFin);
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
