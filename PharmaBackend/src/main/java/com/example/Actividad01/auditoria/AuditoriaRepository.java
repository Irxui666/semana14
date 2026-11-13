package com.example.Actividad01.auditoria;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

interface AuditoriaRepository extends JpaRepository<AuditoriaEvento, Long>,
        JpaSpecificationExecutor<AuditoriaEvento> {}
