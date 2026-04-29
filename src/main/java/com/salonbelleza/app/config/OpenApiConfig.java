package com.salonbelleza.app.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem.HttpMethod;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI salonOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Salon Belleza API")
                        .version("v1")
                        .description("API del portal Salon Belleza. En Swagger usa admin / 12 para obtener token."))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .tags(List.of(
                        new Tag().name("01 - Autenticacion").description("Obtener token, refresh token y usuario actual."),
                        new Tag().name("dashboard-controller"),
                        new Tag().name("servicio-controller"),
                        new Tag().name("cita-controller"),
                        new Tag().name("cliente-controller"),
                        new Tag().name("usuario-controller")
                ));
    }

    @Bean
    public OpenApiCustomizer authByHttpMethodCustomizer() {
        return openApi -> openApi.getPaths().forEach((path, pathItem) -> {
            for (Map.Entry<HttpMethod, Operation> entry : pathItem.readOperationsMap().entrySet()) {
                Operation operation = entry.getValue();
                if (entry.getKey() == HttpMethod.GET || path.startsWith("/api/auth/")) {
                    operation.setSecurity(List.of());
                } else {
                    operation.setSecurity(List.of(new SecurityRequirement().addList(BEARER_AUTH)));
                }
            }
        });
    }
}
