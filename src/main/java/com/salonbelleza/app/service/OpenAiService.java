package com.salonbelleza.app.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.salonbelleza.app.dto.ChatMessage;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenAiService {

    private static final String OPENAI_URL   = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL        = "gpt-4o-mini";
    private static final String SYSTEM_PROMPT =
        "Eres Luna, asistente virtual del Salón Belleza & Estilo en Quito, Ecuador. " +
        "Ayudas a las clientas con reservas, servicios, precios, horarios y dudas generales. " +
        "Responde siempre en español, de forma amable, concisa y con un tono cálido y profesional. " +
        "No uses emojis en exceso.\n\n" +
        "SERVICIOS Y PRECIOS:\n" +
        "- Corte & Peinado: desde $15 (60 min)\n" +
        "- Color & Mechas / Balayage: desde $45 (120 min)\n" +
        "- Tratamientos capilares (keratina, botox capilar): desde $30 (90 min)\n" +
        "- Maquillaje social o nupcial: desde $25 (60 min)\n" +
        "- Manicure / Pedicure / Uñas gel: desde $12 (45 min)\n" +
        "- Facial & Spa: desde $35 (90 min)\n" +
        "- Agendamiento grupal (novias, quinceañeras): paquetes especiales, consultar.\n\n" +
        "EQUIPO: Valentina Ríos (colorista senior), Andrés Morales (barbero/estilista), " +
        "Gabriela Salas (uñas), Carolina Vega (esteticista facial).\n" +
        "HORARIO: Lunes–Sábado 9:00–19:00. Domingo 10:00–15:00.\n" +
        "UBICACIÓN: Av. República 123 y Naciones Unidas, Quito.\n" +
        "TELÉFONO: +593 98 765 4321\n" +
        "EMAIL: hola@bellezayestilo.ec\n\n" +
        "Si la clienta quiere reservar, indícale que puede hacerlo en el sitio web " +
        "(sección Reservar cita) o escribirnos al WhatsApp. " +
        "Si no sabes algo con certeza, dilo y ofrece el contacto directo.";

    @Value("${openai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(List<ChatMessage> userMessages) {
        // Build messages: system prompt + conversation history
        List<OaiMessage> messages = new ArrayList<>();
        messages.add(new OaiMessage("system", SYSTEM_PROMPT));
        userMessages.forEach(m -> messages.add(new OaiMessage(m.getRole(), m.getContent())));

        OaiRequest body = new OaiRequest(MODEL, messages, 400, 0.7);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        try {
            ResponseEntity<OaiResponse> resp = restTemplate.exchange(
                OPENAI_URL,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                OaiResponse.class
            );

            if (resp.getBody() != null && !resp.getBody().getChoices().isEmpty()) {
                return resp.getBody().getChoices().get(0).getMessage().getContent().trim();
            }
        } catch (Exception e) {
            log.error("Error llamando a OpenAI: {}", e.getMessage());
        }

        return "Disculpa, tuve un problema técnico. Por favor escríbenos al WhatsApp +593 98 765 4321.";
    }

    // ===== OpenAI API DTOs (internos) =====

    @Data
    private static class OaiRequest {
        private final String model;
        private final List<OaiMessage> messages;
        @JsonProperty("max_tokens")
        private final int maxTokens;
        private final double temperature;
    }

    @Data
    @lombok.AllArgsConstructor
    private static class OaiMessage {
        private String role;
        private String content;
    }

    @lombok.NoArgsConstructor
    @Data
    private static class OaiResponse {
        private List<OaiChoice> choices;
    }

    @lombok.NoArgsConstructor
    @Data
    private static class OaiChoice {
        private OaiMessage message;
    }
}
