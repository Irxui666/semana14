package com.example.Actividad01.auditoria;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;

@Entity
@Table(name = "auditoria_eventos")
@Getter
public class AuditoriaEvento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime fecha;
    private String usuario;
    private String accion;
    private String entidad;
    private Long entidadId;
    private String detalle;
    private String requestId;

    protected AuditoriaEvento() {}

    AuditoriaEvento(EventoAuditoria evento) {
        fecha = LocalDateTime.now();
        usuario = evento.usuario().substring(0, Math.min(evento.usuario().length(), 50));
        accion = evento.accion();
        entidad = evento.entidad();
        entidadId = evento.entidadId();
        detalle = evento.detalle();
        requestId = evento.requestId();
    }
}
