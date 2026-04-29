package com.salonbelleza.app.config;

import com.salonbelleza.app.entity.Rol;
import com.salonbelleza.app.entity.Usuario;
import com.salonbelleza.app.repository.RolRepository;
import com.salonbelleza.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@Profile("local")
@RequiredArgsConstructor
public class LocalAdminSeeder implements CommandLineRunner {

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_EMAIL = "admin@salon.local";
    private static final String ADMIN_PASSWORD = "12";

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Rol adminRole = rolRepository.findByNombre("Administrador")
                .orElseGet(() -> rolRepository.save(Rol.builder()
                        .nombre("Administrador")
                        .descripcion("Acceso total al sistema")
                        .createdAt(OffsetDateTime.now())
                        .build()));

        Usuario admin = usuarioRepository.findByUsername(ADMIN_USERNAME)
                .or(() -> usuarioRepository.findByEmail(ADMIN_EMAIL))
                .orElseGet(Usuario::new);

        admin.setUsername(ADMIN_USERNAME);
        admin.setEmail(ADMIN_EMAIL);
        admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setNombreCompleto("Administrador Local");
        admin.setTelefono("0000000000");
        admin.setRol(adminRole);
        admin.setEstado("Activo");
        admin.setIntentosFallidos((short) 0);
        admin.setBloqueadoHasta(null);
        admin.setDebeCambiarPass(false);
        if (admin.getCreatedAt() == null) {
            admin.setCreatedAt(OffsetDateTime.now());
        }
        admin.setUpdatedAt(OffsetDateTime.now());

        usuarioRepository.save(admin);
    }
}
