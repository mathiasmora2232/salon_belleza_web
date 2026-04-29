package com.salonbelleza.app.service;

import com.salonbelleza.app.dto.UsuarioRequest;
import com.salonbelleza.app.entity.Rol;
import com.salonbelleza.app.entity.Usuario;
import com.salonbelleza.app.repository.RolRepository;
import com.salonbelleza.app.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con email: " + email));
    }

    @Transactional(readOnly = true)
    public Usuario findByUsername(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con username: " + username));
    }

    @Transactional(readOnly = true)
    public List<Usuario> findByEstado(String estado) {
        return usuarioRepository.findByEstado(estado);
    }

    public Usuario save(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public Usuario create(UsuarioRequest req) {
        validateCreate(req);
        Rol rol = rolRepository.findById(req.getRolId())
                .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado: " + req.getRolId()));
        OffsetDateTime now = OffsetDateTime.now();
        Usuario usuario = Usuario.builder()
                .username(req.getUsername().trim())
                .email(req.getEmail().trim())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .nombreCompleto(req.getNombreCompleto().trim())
                .telefono(req.getTelefono())
                .rol(rol)
                .estado(req.getEstado() != null ? req.getEstado() : "Activo")
                .intentosFallidos((short) 0)
                .debeCambiarPass(false)
                .createdAt(now)
                .updatedAt(now)
                .build();
        return usuarioRepository.save(usuario);
    }

    public Usuario update(Long id, UsuarioRequest req) {
        Usuario existente = findById(id);
        if (req.getUsername() != null && !req.getUsername().isBlank()) existente.setUsername(req.getUsername().trim());
        if (req.getEmail() != null && !req.getEmail().isBlank()) existente.setEmail(req.getEmail().trim());
        if (req.getPassword() != null && !req.getPassword().isBlank()) existente.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        if (req.getNombreCompleto() != null && !req.getNombreCompleto().isBlank()) existente.setNombreCompleto(req.getNombreCompleto().trim());
        existente.setTelefono(req.getTelefono());
        if (req.getRolId() != null) {
            existente.setRol(rolRepository.findById(req.getRolId())
                    .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado: " + req.getRolId())));
        }
        if (req.getEstado() != null) existente.setEstado(req.getEstado());
        existente.setUpdatedAt(OffsetDateTime.now());
        return usuarioRepository.save(existente);
    }

    public Usuario update(Long id, Usuario usuarioActualizado) {
        Usuario existente = findById(id);
        existente.setNombreCompleto(usuarioActualizado.getNombreCompleto());
        existente.setTelefono(usuarioActualizado.getTelefono());
        existente.setAvatarUrl(usuarioActualizado.getAvatarUrl());
        existente.setEstado(usuarioActualizado.getEstado());
        existente.setRol(usuarioActualizado.getRol());
        return usuarioRepository.save(existente);
    }

    public void delete(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    private void validateCreate(UsuarioRequest req) {
        if (req.getUsername() == null || req.getUsername().isBlank()) throw new IllegalArgumentException("El username es obligatorio.");
        if (req.getEmail() == null || req.getEmail().isBlank()) throw new IllegalArgumentException("El email es obligatorio.");
        if (req.getPassword() == null || req.getPassword().isBlank()) throw new IllegalArgumentException("La contraseña es obligatoria.");
        if (req.getNombreCompleto() == null || req.getNombreCompleto().isBlank()) throw new IllegalArgumentException("El nombre es obligatorio.");
        if (req.getRolId() == null) throw new IllegalArgumentException("El rol es obligatorio.");
        if (usuarioRepository.existsByUsername(req.getUsername().trim())) throw new IllegalArgumentException("Ya existe un usuario con ese username.");
        if (usuarioRepository.existsByEmail(req.getEmail().trim())) throw new IllegalArgumentException("Ya existe un usuario con ese email.");
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return usuarioRepository.existsByUsername(username);
    }
}
