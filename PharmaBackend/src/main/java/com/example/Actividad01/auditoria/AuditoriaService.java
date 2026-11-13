package com.example.Actividad01.auditoria;

import com.example.Actividad01.dto.PaginaResponseDTO;
import com.example.Actividad01.exception.ReglaNegocioException;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@Service
public class AuditoriaService {
    private final AuditoriaRepository repository;

    AuditoriaService(AuditoriaRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(EventoAuditoria evento) {
        repository.save(new AuditoriaEvento(evento));
    }

    @Transactional(readOnly = true)
    public PaginaResponseDTO<AuditoriaEvento> buscar(String usuario, String accion, LocalDate desde,
                                                   LocalDate hasta, int pagina, int tamanio) {
        if (pagina < 0 || tamanio < 1 || tamanio > 100 || (desde != null && hasta != null && desde.isAfter(hasta))) {
            throw new ReglaNegocioException("Paginación o rango de fechas inválido.");
        }
        var pageable = PageRequest.of(pagina, tamanio, Sort.by(Sort.Direction.DESC, "fecha", "id"));
        return PaginaResponseDTO.from(repository.findAll((root, query, cb) -> {
            var filtros = new ArrayList<Predicate>();
            if (usuario != null && !usuario.isBlank()) filtros.add(cb.equal(root.get("usuario"), usuario.trim()));
            if (accion != null && !accion.isBlank()) filtros.add(cb.equal(root.get("accion"), accion.trim()));
            if (desde != null) filtros.add(cb.greaterThanOrEqualTo(root.get("fecha"), desde.atStartOfDay()));
            if (hasta != null) filtros.add(cb.lessThan(root.get("fecha"), hasta.plusDays(1).atStartOfDay()));
            return cb.and(filtros.toArray(Predicate[]::new));
        }, pageable));
    }
}
