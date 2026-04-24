package com.salonbelleza.app.service;

import com.salonbelleza.app.dto.PaqueteRequest;
import com.salonbelleza.app.entity.Paquete;
import com.salonbelleza.app.entity.PaqueteServicio;
import com.salonbelleza.app.entity.Servicio;
import com.salonbelleza.app.repository.PaqueteRepository;
import com.salonbelleza.app.repository.ServicioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaqueteService {

    private final PaqueteRepository paqueteRepository;
    private final ServicioRepository servicioRepository;

    public List<Paquete> findAll() {
        return paqueteRepository.findAll();
    }

    public List<Paquete> findByEstado(String estado) {
        return paqueteRepository.findByEstado(estado);
    }

    public Paquete findById(Long id) {
        return paqueteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Paquete no encontrado: " + id));
    }

    @Transactional
    public Paquete create(PaqueteRequest req) {
        Paquete paquete = Paquete.builder()
                .nombre(req.getNombre())
                .descripcion(req.getDescripcion())
                .precio(req.getPrecio())
                .precioReferencia(req.getPrecioReferencia())
                .duracionMin(req.getDuracionMin() != null ? req.getDuracionMin() : 60)
                .descuentoPorcentaje(req.getDescuentoPorcentaje())
                .estado(req.getEstado() != null ? req.getEstado() : "Activo")
                .imagenUrl(req.getImagenUrl())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        paquete = paqueteRepository.save(paquete);
        attachServicios(paquete, req.getServicioIds());
        return paqueteRepository.save(paquete);
    }

    @Transactional
    public Paquete update(Long id, PaqueteRequest req) {
        Paquete paquete = findById(id);
        paquete.setNombre(req.getNombre());
        paquete.setDescripcion(req.getDescripcion());
        paquete.setPrecio(req.getPrecio());
        paquete.setPrecioReferencia(req.getPrecioReferencia());
        if (req.getDuracionMin() != null) paquete.setDuracionMin(req.getDuracionMin());
        paquete.setDescuentoPorcentaje(req.getDescuentoPorcentaje());
        if (req.getEstado() != null) paquete.setEstado(req.getEstado());
        paquete.setImagenUrl(req.getImagenUrl());
        paquete.setUpdatedAt(OffsetDateTime.now());

        paquete.getServicios().clear();
        attachServicios(paquete, req.getServicioIds());
        return paqueteRepository.save(paquete);
    }

    @Transactional
    public void delete(Long id) {
        paqueteRepository.delete(findById(id));
    }

    private void attachServicios(Paquete paquete, List<Long> servicioIds) {
        if (servicioIds == null || servicioIds.isEmpty()) return;
        for (int i = 0; i < servicioIds.size(); i++) {
            Long svcId = servicioIds.get(i);
            Servicio servicio = servicioRepository.findById(svcId)
                    .orElseThrow(() -> new EntityNotFoundException("Servicio no encontrado: " + svcId));
            PaqueteServicio ps = PaqueteServicio.builder()
                    .paquete(paquete)
                    .servicio(servicio)
                    .orden((short) (i + 1))
                    .build();
            paquete.getServicios().add(ps);
        }
    }
}
