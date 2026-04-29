package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.Cliente;
import com.salonbelleza.app.entity.ClienteFicha;
import com.salonbelleza.app.entity.ClienteNota;
import com.salonbelleza.app.repository.CajaVentaRepository;
import com.salonbelleza.app.repository.CitaRepository;
import com.salonbelleza.app.repository.ClienteFichaRepository;
import com.salonbelleza.app.repository.ClienteNotaRepository;
import com.salonbelleza.app.repository.ClienteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteFichaRepository fichaRepository;
    private final ClienteNotaRepository notaRepository;
    private final CitaRepository citaRepository;
    private final CajaVentaRepository cajaVentaRepository;

    @Transactional(readOnly = true)
    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Cliente findById(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Cliente> findByNombre(String nombre) {
        return clienteRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Transactional(readOnly = true)
    public Cliente findByTelefono(String telefono) {
        return clienteRepository.findByTelefono(telefono)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con telefono: " + telefono));
    }

    @Transactional(readOnly = true)
    public List<Cliente> findByEstado(String estado) {
        return clienteRepository.findByEstado(estado);
    }

    public Cliente save(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Cliente update(Long id, Cliente updated) {
        Cliente existente = findById(id);
        existente.setNombre(updated.getNombre());
        existente.setApellido(updated.getApellido());
        existente.setTelefono(updated.getTelefono());
        existente.setEmail(updated.getEmail());
        existente.setGenero(updated.getGenero());
        existente.setFechaNacimiento(updated.getFechaNacimiento());
        existente.setDireccion(updated.getDireccion());
        existente.setCiudad(updated.getCiudad());
        existente.setEstado(updated.getEstado());
        return clienteRepository.save(existente);
    }

    public void delete(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new EntityNotFoundException("Cliente no encontrado con id: " + id);
        }
        clienteRepository.deleteById(id);
    }

    // --- Fichas ---

    @Transactional(readOnly = true)
    public ClienteFicha findFichaByClienteId(Long clienteId) {
        return fichaRepository.findById(clienteId).orElseGet(() -> {
            ClienteFicha ficha = new ClienteFicha();
            ficha.setClienteId(clienteId);
            ficha.setCliente(findById(clienteId));
            return ficha;
        });
    }

    public ClienteFicha saveFicha(ClienteFicha ficha) {
        return fichaRepository.save(ficha);
    }

    // --- Notas ---

    @Transactional(readOnly = true)
    public List<ClienteNota> findNotasByCliente(Long clienteId) {
        return notaRepository.findByClienteId(clienteId);
    }

    public ClienteNota saveNota(ClienteNota nota) {
        return notaRepository.save(nota);
    }

    public void deleteNota(Long notaId) {
        notaRepository.deleteById(notaId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> historialCompleto(Long clienteId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("cliente", findById(clienteId));
        data.put("ficha", findFichaByClienteId(clienteId));
        data.put("notas", findNotasByCliente(clienteId));
        data.put("citas", citaRepository.findByClienteId(clienteId));
        data.put("ventas", cajaVentaRepository.findByClienteIdOrderByFechaDesc(clienteId));
        return data;
    }
}
