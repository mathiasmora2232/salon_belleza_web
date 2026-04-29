package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.LoginRequest;
import com.salonbelleza.app.dto.LoginResponse;
import com.salonbelleza.app.dto.RefreshTokenRequest;
import com.salonbelleza.app.dto.RegisterRequest;
import com.salonbelleza.app.entity.Rol;
import com.salonbelleza.app.entity.Usuario;
import com.salonbelleza.app.repository.RolRepository;
import com.salonbelleza.app.repository.UsuarioRepository;
import com.salonbelleza.app.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "01 - Autenticacion", description = "Login, token admin, refresh token y usuario actual.")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final int MAX_INTENTOS = 5;
    private static final int BLOQUEO_MINUTOS = 15;
    private static final String ADMIN_LOGIN = "admin";
    private static final String ADMIN_PASSWORD = "12";

    @Operation(
            summary = "Obtener token admin",
            description = "Devuelve un JWT y refresh token para el usuario local de prueba admin / 12."
    )
    @SecurityRequirements
    @PostMapping("/admin-token")
    public ResponseEntity<?> adminToken() {
        LoginRequest req = new LoginRequest();
        req.setEmail(ADMIN_LOGIN);
        req.setPassword(ADMIN_PASSWORD);
        return authenticate(req);
    }

    @Operation(
            summary = "Autenticacion con usuario y contrasena",
            description = "Acepta email o username. Para pruebas locales usa admin / 12."
    )
    @SecurityRequirements
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        return authenticate(req);
    }

    private ResponseEntity<?> authenticate(LoginRequest req) {
        String login = req.getEmail() != null ? req.getEmail().trim() : "";
        Usuario usuario = usuarioRepository.findByEmail(login)
                .or(() -> usuarioRepository.findByUsername(login))
                .orElse(null);

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
        String token        = jwtUtil.generate(usuario.getId(), usuario.getEmail(), rolNombre);
        String refreshToken = jwtUtil.generateRefresh(usuario.getId(), usuario.getEmail(), rolNombre);

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(rolNombre)
                .debeCambiarPass(Boolean.TRUE.equals(usuario.getDebeCambiarPass()))
                .build());
    }

    @Operation(summary = "Registrar cliente")
    @SecurityRequirements
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (usuarioRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe una cuenta con ese correo."));
        }

        Rol rolCliente = rolRepository.findByNombre("Cliente")
                .orElseThrow(() -> new RuntimeException("Rol Cliente no encontrado"));

        String username = req.getEmail().split("@")[0] + "_" + System.currentTimeMillis() % 10000;

        Usuario usuario = Usuario.builder()
                .email(req.getEmail())
                .username(username)
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .nombreCompleto(req.getFirstName() + " " + req.getLastName())
                .telefono(req.getPhone())
                .rol(rolCliente)
                .estado("Activo")
                .intentosFallidos((short) 0)
                .debeCambiarPass(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        usuarioRepository.save(usuario);

        String token        = jwtUtil.generate(usuario.getId(), usuario.getEmail(), rolCliente.getNombre());
        String refreshToken = jwtUtil.generateRefresh(usuario.getId(), usuario.getEmail(), rolCliente.getNombre());

        return ResponseEntity.status(HttpStatus.CREATED).body(LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(usuario.getId())
                .email(usuario.getEmail())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(rolCliente.getNombre())
                .debeCambiarPass(false)
                .build());
    }

    @Operation(
            summary = "Obtener refresh token",
            description = "Recibe un refresh token valido y devuelve un nuevo token JWT y un nuevo refresh token."
    )
    @SecurityRequirements
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshTokenRequest body) {
        String refreshToken = body.getRefreshToken();
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("error", "refreshToken requerido."));
        }
        if (!jwtUtil.isValid(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("error", "Refresh token inválido o expirado."));
        }

        String email = jwtUtil.getEmail(refreshToken);
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null || !"Activo".equals(usuario.getEstado())) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no encontrado o inactivo."));
        }

        String rolNombre    = usuario.getRol() != null ? usuario.getRol().getNombre() : "USER";
        String newToken     = jwtUtil.generate(usuario.getId(), email, rolNombre);
        String newRefresh   = jwtUtil.generateRefresh(usuario.getId(), email, rolNombre);

        return ResponseEntity.ok(Map.of(
                "token",        newToken,
                "refreshToken", newRefresh
        ));
    }

    @Operation(summary = "Usuario autenticado")
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
