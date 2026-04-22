package com.salonbelleza.app.controller;

import com.salonbelleza.app.dto.ChatRequest;
import com.salonbelleza.app.dto.ChatResponse;
import com.salonbelleza.app.service.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final OpenAiService openAiService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getMessages() == null || request.getMessages().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Mensaje vacío."));
        }
        String reply = openAiService.chat(request.getMessages());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
