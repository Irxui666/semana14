package com.example.Actividad01.auditoria;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class AuditoriaListener {
    private static final Logger LOG = LoggerFactory.getLogger(AuditoriaListener.class);
    private final AuditoriaService service;

    public AuditoriaListener(AuditoriaService service) {
        this.service = service;
    }

    @TransactionalEventListener
    public void registrar(EventoAuditoria evento) {
        try {
            service.registrar(evento);
        } catch (RuntimeException ex) {
            LOG.error("No se pudo auditar {} {}", evento.accion(), evento.entidadId(), ex);
        }
    }
}
