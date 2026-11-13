# Incidencias de la sesión 14

| ID | Módulo | Reproducción | Severidad | Causa | Corrección | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| INC-01 | Productos | Abrir el catálogo con más de 20 productos | Alta | La vista solicitaba el catálogo completo y filtraba en memoria | API paginada, filtro en servidor y paginador. Playwright verificó la segunda página y F5 | Corregida localmente |
| INC-02 | Ventas | Abrir una página de la consulta y recargar | Media | El número de página y los filtros vivían en el componente | Parámetros en la URL y reinicio a página 0 al aplicar filtros o cambiar filas | Corregida localmente. Falta recorrer I-08 en navegador |
| INC-03 | Playwright | Ejecutar con Edge y video habilitado sin FFmpeg | Media | Faltaba el componente de grabación | Instalación de FFmpeg. Corrida posterior de 21 casos aprobada | Cerrada en entorno local |

Los cambios están en el espacio de trabajo. Las referencias de commit se completan al versionar.
