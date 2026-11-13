package com.example.Actividad01.auditoria;

import com.example.Actividad01.config.AuditoriaConfig;
import org.slf4j.MDC;

public record EventoAuditoria(String usuario, String accion, String entidad, Long entidadId,
                              String detalle, String requestId) {
    public static EventoAuditoria negocio(String accion, String entidad, Long id, String detalle) {
        return new EventoAuditoria(AuditoriaConfig.usuario(), accion, entidad, id, detalle, MDC.get("requestId"));
    }

    public static EventoAuditoria login(String accion, String usuario) {
        return new EventoAuditoria(usuario, accion, "Usuario", null, null, MDC.get("requestId"));
    }
}
