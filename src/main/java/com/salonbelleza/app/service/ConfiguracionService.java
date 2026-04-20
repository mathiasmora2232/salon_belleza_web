package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.Configuracion;
import com.salonbelleza.app.repository.ConfiguracionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ConfiguracionService {

    private final ConfiguracionRepository configuracionRepository;

    @Transactional(readOnly = true)
    public List<Configuracion> findAll() {
        return configuracionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Configuracion findByClave(String clave) {
        return configuracionRepository.findById(clave)
                .orElseThrow(() -> new EntityNotFoundException("Configuracion no encontrada para clave: " + clave));
    }

    @Transactional(readOnly = true)
    public String getValor(String clave) {
        return findByClave(clave).getValor();
    }

    public Configuracion save(Configuracion configuracion) {
        return configuracionRepository.save(configuracion);
    }

    public Configuracion update(String clave, String nuevoValor) {
        Configuracion existente = findByClave(clave);
        existente.setValor(nuevoValor);
        return configuracionRepository.save(existente);
    }

    public void delete(String clave) {
        if (!configuracionRepository.existsById(clave)) {
            throw new EntityNotFoundException("Configuracion no encontrada para clave: " + clave);
        }
        configuracionRepository.deleteById(clave);
    }
}
