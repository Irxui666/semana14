package com.example.Actividad01.service.service;

import com.example.Actividad01.dto.ProductoRequestDTO;
import com.example.Actividad01.dto.ProductoResponseDTO;
import com.example.Actividad01.service.generic.CrudService;

import com.example.Actividad01.dto.PaginaResponseDTO;

public interface ProductoService extends CrudService<ProductoRequestDTO, ProductoResponseDTO, Long> {
    PaginaResponseDTO<ProductoResponseDTO> buscar(int pagina, int tamanio, String orden,
                                                String direccion, String filtro);
}
