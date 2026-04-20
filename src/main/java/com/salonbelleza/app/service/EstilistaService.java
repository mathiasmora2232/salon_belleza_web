package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.Estilista;
import com.salonbelleza.app.entity.EstilistaExcepcion;
import com.salonbelleza.app.entity.EstilistaHorario;
import com.salonbelleza.app.repository.EstilistaExcepcionRepository;
import com.salonbelleza.app.repository.EstilistaHorarioRepository;
import com.salonbelleza.app.repository.EstilistaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class EstilistaService {

    private final EstilistaRepository estilistaRepository;
    private final EstilistaHorarioRepository horarioRepository;
    private final EstilistaExcepcionRepository excepcionRepository;

    @Transactional(readOnly = true)
    public List<Estilista> findAll() {
        return estilistaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Estilista findById(Long id) {
        return estilistaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Estilista no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Estilista> findByEstado(String estado) {
        return estilistaRepository.findByEstado(estado);
    }

    @Transactional(readOnly = true)
    public Estilista findByUsuarioId(Long usuarioId) {
        return estilistaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Estilista no encontrado para usuarioId: " + usuarioId));
    }

    public Estilista save(Estilista estilista) {
        return estilistaRepository.save(estilista);
    }

    public Estilista update(Long id, Estilista updated) {
        Estilista existente = findById(id);
        existente.setNombre(updated.getNombre());
        existente.setTelefono(updated.getTelefono());
        existente.setEspecialidad(updated.getEspecialidad());
        existente.setExperienciaAnios(updated.getExperienciaAnios());
        existente.setComisionPorcentaje(updated.getComisionPorcentaje());
        existente.setEstado(updated.getEstado());
        existente.setFechaSalida(updated.getFechaSalida());
        return estilistaRepository.save(existente);
    }

    public void delete(Long id) {
        if (!estilistaRepository.existsById(id)) {
            throw new EntityNotFoundException("Estilista no encontrado con id: " + id);
        }
        estilistaRepository.deleteById(id);
    }

    // --- Horarios ---

    @Transactional(readOnly = true)
    public List<EstilistaHorario> findHorariosByEstilista(Long estilistaId) {
        return horarioRepository.findByEstilistaId(estilistaId);
    }

    public EstilistaHorario saveHorario(EstilistaHorario horario) {
        return horarioRepository.save(horario);
    }

    public void deleteHorario(Long horarioId) {
        horarioRepository.deleteById(horarioId);
    }

    // --- Excepciones ---

    @Transactional(readOnly = true)
    public List<EstilistaExcepcion> findExcepcionesByEstilista(Long estilistaId) {
        return excepcionRepository.findByEstilistaId(estilistaId);
    }

    public EstilistaExcepcion saveExcepcion(EstilistaExcepcion excepcion) {
        return excepcionRepository.save(excepcion);
    }

    public void deleteExcepcion(Long excepcionId) {
        excepcionRepository.deleteById(excepcionId);
    }
}
