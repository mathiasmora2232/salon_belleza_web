package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.Cita;
import com.salonbelleza.app.entity.CitaEstado;
import com.salonbelleza.app.entity.CitaHistorial;
import com.salonbelleza.app.entity.CitaServicio;
import com.salonbelleza.app.repository.CitaEstadoRepository;
import com.salonbelleza.app.repository.CitaHistorialRepository;
import com.salonbelleza.app.repository.CitaRepository;
import com.salonbelleza.app.repository.CitaServicioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final CitaServicioRepository citaServicioRepository;
    private final CitaHistorialRepository citaHistorialRepository;
    private final CitaEstadoRepository citaEstadoRepository;

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

    public Cita cambiarEstado(Long citaId, String codigoEstado) {
        Cita cita = findById(citaId);
        CitaEstado nuevoEstado = citaEstadoRepository.findByCodigo(codigoEstado)
                .orElseThrow(() -> new EntityNotFoundException("Estado no encontrado: " + codigoEstado));
        cita.setEstado(nuevoEstado);
        return citaRepository.save(cita);
    }
}
