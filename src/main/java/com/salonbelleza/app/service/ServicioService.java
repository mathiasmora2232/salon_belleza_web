package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.CategoriaServicio;
import com.salonbelleza.app.entity.Servicio;
import com.salonbelleza.app.repository.CategoriaServicioRepository;
import com.salonbelleza.app.repository.ServicioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ServicioService {

    private final ServicioRepository servicioRepository;
    private final CategoriaServicioRepository categoriaRepository;

    // --- Servicios ---

    @Transactional(readOnly = true)
    public List<Servicio> findAll() {
        return servicioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Servicio findById(Long id) {
        return servicioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Servicio> findByEstado(String estado) {
        return servicioRepository.findByEstado(estado);
    }

    @Transactional(readOnly = true)
    public List<Servicio> findByCategoriaAndEstado(Long categoriaId, String estado) {
        return servicioRepository.findByCategoriaIdAndEstado(categoriaId, estado);
    }

    public Servicio save(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    public Servicio update(Long id, Servicio updated) {
        Servicio existente = findById(id);
        existente.setNombre(updated.getNombre());
        existente.setDescripcion(updated.getDescripcion());
        existente.setPrecio(updated.getPrecio());
        existente.setDuracionMin(updated.getDuracionMin());
        existente.setComisionAplica(updated.getComisionAplica());
        existente.setComisionOverride(updated.getComisionOverride());
        existente.setEstado(updated.getEstado());
        existente.setCategoria(updated.getCategoria());
        return servicioRepository.save(existente);
    }

    public void delete(Long id) {
        if (!servicioRepository.existsById(id)) {
            throw new EntityNotFoundException("Servicio no encontrado con id: " + id);
        }
        servicioRepository.deleteById(id);
    }

    // --- Categorias de Servicios ---

    @Transactional(readOnly = true)
    public List<CategoriaServicio> findAllCategorias() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CategoriaServicio findCategoriaById(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Categoria no encontrada con id: " + id));
    }

    public CategoriaServicio saveCategoria(CategoriaServicio categoria) {
        return categoriaRepository.save(categoria);
    }

    public void deleteCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new EntityNotFoundException("Categoria no encontrada con id: " + id);
        }
        categoriaRepository.deleteById(id);
    }
}
