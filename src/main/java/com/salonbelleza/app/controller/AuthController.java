package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.LoginRequest;
import com.salonbelleza.app.dto.LoginResponse;
import com.salonbelleza.app.entity.Usuario;
import com.salonbelleza.app.repository.UsuarioRepository;
import com.salonbelleza.app.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final int MAX_INTENTOS = 5;
    private static final int BLOQUEO_MINUTOS = 15;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Usuario usuario = usuarioRepository.findByEmail(req.getEmail()).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas."));
        }

        if (!"Activo".equals(usuario.getEstado())) {
            return ResponseEntity.status(403).body(Map.of("error", "Cuenta inactiva. Contacta al administrador."));
        }

        if (usuario.getBloqueadoHasta() != null && usuario.getBloqueadoHasta().isAfter(OffsetDateTime.now())) {
            return ResponseEntity.status(423).body(Map.of(
                "error", "Cuenta bloqueada temporalmente. Intenta de nuevo más tarde.",
                "bloqueadoHasta", usuario.getBloqueadoHasta().toString()
            ));
        }

        if (!passwordEncoder.matches(req.getPassword(), usuario.getPasswordHash())) {
            short intentos = (short) ((usuario.getIntentosFallidos() == null ? 0 : usuario.getIntentosFallidos()) + 1);
            usuario.setIntentosFallidos(intentos);
            if (intentos >= MAX_INTENTOS) {
                usuario.setBloqueadoHasta(OffsetDateTime.now().plusMinutes(BLOQUEO_MINUTOS));
                usuarioRepository.save(usuario);
                return ResponseEntity.status(423).body(Map.of(
                    "error", "Demasiados intentos fallidos. Cuenta bloqueada por " + BLOQUEO_MINUTOS + " minutos."
                ));
            }
            usuarioRepository.save(usuario);
            return ResponseEntity.status(401).body(Map.of(
                "error", "Credenciales incorrectas.",
                "intentosRestantes", MAX_INTENTOS - intentos
            ));
        }

        // Login exitoso
        usuario.setIntentosFallidos((short) 0);
        usuario.setBloqueadoHasta(null);
        usuario.setUltimoLogin(OffsetDateTime.now());
        usuarioRepository.save(usuario);

        String rolNombre = usuario.getRol() != null ? usuario.getRol().getNombre() : "USER";
        String token = jwtUtil.generate(usuario.getId(), usuario.getEmail(), rolNombre);

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(rolNombre)
                .debeCambiarPass(Boolean.TRUE.equals(usuario.getDebeCambiarPass()))
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Token requerido."));
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Token inválido o expirado."));
        }
        String email = jwtUtil.getEmail(token);
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String rolNombre = usuario.getRol() != null ? usuario.getRol().getNombre() : "USER";
        return ResponseEntity.ok(LoginResponse.builder()
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(rolNombre)
                .debeCambiarPass(Boolean.TRUE.equals(usuario.getDebeCambiarPass()))
                .build());
    }
}
