package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.Comision;
import com.salonbelleza.app.repository.ComisionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ComisionService {

    private final ComisionRepository comisionRepository;

    @Transactional(readOnly = true)
    public List<Comision> findAll() {
        return comisionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Comision findById(Long id) {
        return comisionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Comision no encontrada con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Comision> findByEstilistaAndEstado(Long estilistaId, String estado) {
        return comisionRepository.findByEstilistaIdAndEstado(estilistaId, estado);
    }

    @Transactional(readOnly = true)
    public List<Comision> findByPeriodo(String periodo) {
        return comisionRepository.findByPeriodo(periodo);
    }

    @Transactional(readOnly = true)
    public List<Comision> findByEstilista(Long estilistaId) {
        return comisionRepository.findByEstilistaId(estilistaId);
    }

    @Transactional(readOnly = true)
    public List<Comision> findByEstado(String estado) {
        return comisionRepository.findByEstado(estado);
    }

    public Comision save(Comision comision) {
        return comisionRepository.save(comision);
    }

    public Comision update(Long id, Comision updated) {
        Comision existente = findById(id);
        existente.setEstado(updated.getEstado());
        existente.setLiquidadaEn(updated.getLiquidadaEn());
        existente.setLiquidadaPor(updated.getLiquidadaPor());
        return comisionRepository.save(existente);
    }

    public void delete(Long id) {
        if (!comisionRepository.existsById(id)) {
            throw new EntityNotFoundException("Comision no encontrada con id: " + id);
        }
        comisionRepository.deleteById(id);
    }
}
