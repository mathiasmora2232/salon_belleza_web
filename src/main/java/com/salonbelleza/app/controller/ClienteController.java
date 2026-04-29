package com.salonbelleza.app.controller;

import com.salonbelleza.app.entity.Cliente;
import com.salonbelleza.app.entity.ClienteFicha;
import com.salonbelleza.app.entity.ClienteNota;
import com.salonbelleza.app.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<Cliente>> getAll() {
        return ResponseEntity.ok(clienteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.findById(id));
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<Map<String, Object>> historial(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.historialCompleto(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Cliente>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(clienteService.findByNombre(nombre));
    }

    @GetMapping("/telefono/{telefono}")
    public ResponseEntity<Cliente> getByTelefono(@PathVariable String telefono) {
        return ResponseEntity.ok(clienteService.findByTelefono(telefono));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Cliente>> getByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(clienteService.findByEstado(estado));
    }

    @PostMapping
    public ResponseEntity<Cliente> create(@RequestBody Cliente cliente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.save(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> update(@PathVariable Long id, @RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteService.update(id, cliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clienteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Fichas

    @GetMapping("/{id}/ficha")
    public ResponseEntity<ClienteFicha> getFicha(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.findFichaByClienteId(id));
    }

    @PostMapping("/{id}/ficha")
    public ResponseEntity<ClienteFicha> saveFicha(@PathVariable Long id, @RequestBody ClienteFicha ficha) {
        ficha.setCliente(clienteService.findById(id));
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.saveFicha(ficha));
    }

    // Notas

    @GetMapping("/{id}/notas")
    public ResponseEntity<List<ClienteNota>> getNotas(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.findNotasByCliente(id));
    }

    @PostMapping("/{id}/notas")
    public ResponseEntity<ClienteNota> addNota(@PathVariable Long id, @RequestBody ClienteNota nota) {
        nota.setCliente(clienteService.findById(id));
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.saveNota(nota));
    }

    @DeleteMapping("/notas/{notaId}")
    public ResponseEntity<Void> deleteNota(@PathVariable Long notaId) {
        clienteService.deleteNota(notaId);
        return ResponseEntity.noContent().build();
    }
}
