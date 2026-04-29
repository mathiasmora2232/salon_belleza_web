package com.salonbelleza.app.service;

import com.salonbelleza.app.entity.Cita;
import com.salonbelleza.app.entity.ReporteEvento;
import com.salonbelleza.app.repository.ReporteEventoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.JREmptyDataSource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReporteService {

    private final ReporteEventoRepository reporteRepository;
    private final CitaService citaService;

    @Transactional
    public byte[] generarReporteEvento(Long citaId) {
        Cita cita = citaService.findById(citaId);
        String obs = cita.getObservaciones() != null ? cita.getObservaciones() : "";

        String tipo      = parseLine(obs, "Evento grupal:");
        String paquete   = parseLine(obs, "Paquete:");
        String nInteg    = parseLine(obs, "Integrantes:");
        String contacto  = cita.getCliente() != null
            ? (cita.getCliente().getNombre() + " " + Optional.ofNullable(cita.getCliente().getApellido()).orElse("")).trim()
            : "—";
        String telefono  = cita.getCliente() != null
            ? Optional.ofNullable(cita.getCliente().getTelefono()).orElse("—")
            : "—";

        // Build readable detail (strip header lines, keep service breakdown)
        String detalle = Arrays.stream(obs.split("\n"))
            .filter(l -> !l.startsWith("Evento grupal:") && !l.startsWith("Paquete:") && !l.startsWith("Integrantes:"))
            .map(l -> l.startsWith("Servicios por integrante:") ? "\nSERVICIOS POR INTEGRANTE:" : l)
            .reduce("", (a, b) -> a + "\n" + b)
            .strip();

        String fecha     = cita.getFecha() != null ? formatFecha(cita.getFecha().toString()) : "—";
        String hora      = cita.getHoraInicio() != null ? cita.getHoraInicio().toString().substring(0, 5) : "—";
        String estado    = cita.getEstado() != null ? cita.getEstado().getNombre().toUpperCase() : "PENDIENTE";
        String generadoEn = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        Map<String, Object> params = new HashMap<>();
        params.put("EVENTO_TIPO",  tipo.isEmpty()    ? "Evento grupal" : tipo);
        params.put("FECHA",        fecha);
        params.put("HORA_INICIO",  hora);
        params.put("CONTACTO",     contacto);
        params.put("TELEFONO",     telefono);
        params.put("PAQUETE",      paquete.isEmpty() ? "—" : paquete);
        params.put("INTEGRANTES",  nInteg.isEmpty()  ? "—" : nInteg);
        params.put("DETALLE",      detalle.isEmpty() ? obs : detalle);
        params.put("ESTADO",       estado);
        params.put("GENERADO_EN",  generadoEn);

        byte[] pdf;
        try {
            InputStream jrxml = getClass().getResourceAsStream("/reports/evento_timeline.jrxml");
            if (jrxml == null) throw new RuntimeException("Template JRXML no encontrado en /reports/evento_timeline.jrxml");
            JasperReport compiled = JasperCompileManager.compileReport(jrxml);
            JasperPrint print     = JasperFillManager.fillReport(compiled, params, new JREmptyDataSource());
            pdf = JasperExportManager.exportReportToPdf(print);
        } catch (JRException e) {
            throw new RuntimeException("Error generando PDF: " + e.getMessage(), e);
        }

        // Upsert in DB
        ReporteEvento reporte = reporteRepository.findByCitaId(citaId).orElse(new ReporteEvento());
        reporte.setCita(cita);
        reporte.setPdfData(pdf);
        reporte.setNombreArchivo("evento_" + citaId + "_" + tipo.toLowerCase().replace(" ", "_") + ".pdf");
        reporte.setGeneradoEn(OffsetDateTime.now());
        reporte.setTamBytes((long) pdf.length);
        reporteRepository.save(reporte);

        return pdf;
    }

    public Optional<ReporteEvento> getReporte(Long citaId) {
        return reporteRepository.findByCitaId(citaId);
    }

    public boolean existeReporte(Long citaId) {
        return reporteRepository.existsByCitaId(citaId);
    }

    private String parseLine(String text, String prefix) {
        return Arrays.stream(text.split("\n"))
            .filter(l -> l.startsWith(prefix))
            .map(l -> l.substring(prefix.length()).trim())
            .findFirst().orElse("");
    }

    private String formatFecha(String iso) {
        try {
            String[] p = iso.split("-");
            String[] meses = {"ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"};
            return p[2] + " " + meses[Integer.parseInt(p[1]) - 1] + " " + p[0];
        } catch (Exception e) { return iso; }
    }
}
