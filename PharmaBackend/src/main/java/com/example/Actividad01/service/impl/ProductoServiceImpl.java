package com.example.Actividad01.service.impl;

import org.slf4j.Logger;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.example.Actividad01.dto.PaginaResponseDTO;
import org.springframework.context.ApplicationEventPublisher;
import com.example.Actividad01.auditoria.EventoAuditoria;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.Actividad01.dto.ProductoRequestDTO;
import com.example.Actividad01.dto.ProductoResponseDTO;
import com.example.Actividad01.entity.Categoria;
import com.example.Actividad01.entity.Producto;
import com.example.Actividad01.exception.RecursosNoEncontradoException;
import com.example.Actividad01.exception.ReglaNegocioException;
import com.example.Actividad01.repository.CategoriaRepository;
import com.example.Actividad01.repository.ProductoRepository;
import com.example.Actividad01.service.service.ProductoService;

@Service
public class ProductoServiceImpl implements ProductoService{
    private static final Logger LOG = LoggerFactory.getLogger(ProductoServiceImpl.class);

    private final ApplicationEventPublisher eventos;
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProductoServiceImpl(ProductoRepository productoRepository,
                               CategoriaRepository categoriaRepository, ApplicationEventPublisher eventos) {
        this.eventos = eventos;
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Transactional
    public ProductoResponseDTO create(ProductoRequestDTO t) {
        String nombre = t.getNombre().trim();
        if(productoRepository.existsByNombreIgnoreCase(nombre)){
            throw new ReglaNegocioException(
                    "Ya existe un producto con el nombre "+ nombre
            );
        }

        Categoria categoria = buscarCategoria(t.getCategoria());

        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setPrecio(t.getPrecio());
        producto.setStock(t.getStock());
        producto.setEstado(t.getEstado());
        producto.setCategoria(categoria);

        Producto prodCreado = productoRepository.save(producto);

        return convertirResponse(prodCreado);
    }

    @Override
    @Transactional
    public ProductoResponseDTO update(Long aLong, ProductoRequestDTO t) {
        Producto producto = productoRepository.findById(aLong).orElseThrow(()->
                new RecursosNoEncontradoException(
                        "Producto no encontrado con id: "+ aLong
                )
        );

        String nombre = t.getNombre().trim();
        if(productoRepository.existsByNombreIgnoreCaseAndIdNot(nombre, aLong)){
            throw new ReglaNegocioException(
                    "Ya existe un producto con el nombre "+ nombre
            );
        }

        Categoria categoria = buscarCategoria(t.getCategoria());

        producto.setNombre(nombre);
        var precioAnterior = producto.getPrecio();
        producto.setPrecio(t.getPrecio());
        producto.setStock(t.getStock());
        producto.setEstado(t.getEstado());
        producto.setCategoria(categoria);

        Producto prodActualizado = productoRepository.saveAndFlush(producto);
        if (precioAnterior.compareTo(producto.getPrecio()) != 0) {
            eventos.publishEvent(EventoAuditoria.negocio("PRECIO_MODIFICADO", "Producto",
                    producto.getId(), precioAnterior + " -> " + producto.getPrecio()));
        }

        return convertirResponse(prodActualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponseDTO read(Long aLong) {
        Producto producto = productoRepository.findById(aLong)
                .orElseThrow(()->
                        new RecursosNoEncontradoException(
                                "Producto no encontrado con id: "+ aLong
                        )
                );
        return convertirResponse(producto);
    }

    @Override
    @Transactional
    public void delete(Long aLong) {
        Producto producto = productoRepository.findById(aLong).orElseThrow(()->
                new RecursosNoEncontradoException(
                        "Producto no encontrado con id: "+ aLong
                )
        );
        productoRepository.delete(producto);
        eventos.publishEvent(EventoAuditoria.negocio("PRODUCTO_ELIMINADO", "Producto",
                producto.getId(), producto.getNombre()));
    }

    @Override
    @Transactional(readOnly = true)
    public Iterable<ProductoResponseDTO> readAll() {
        return productoRepository.findAll()
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaginaResponseDTO<ProductoResponseDTO> buscar(int pagina, int tamanio, String orden,
                                                       String direccion, String filtro) {
        if (pagina < 0 || tamanio < 1 || tamanio > 100 || !Set.of("id", "nombre", "precio", "stock").contains(orden)
                || !Set.of("asc", "desc").contains(direccion.toLowerCase(java.util.Locale.ROOT))) {
            throw new ReglaNegocioException("Paginación u orden inválido.");
        }
        var sort = Sort.by(Sort.Direction.fromString(direccion), orden);
        if (!"id".equals(orden)) sort = sort.and(Sort.by("id"));
        var pageable = PageRequest.of(pagina, tamanio, sort);
        var resultado = filtro == null || filtro.isBlank()
                ? productoRepository.findAll(pageable)
                : productoRepository.findByNombreContainingIgnoreCaseOrCategoriaNombreContainingIgnoreCase(
                        filtro.trim(), filtro.trim(), pageable);
        return PaginaResponseDTO.from(resultado.map(this::convertirResponse));
    }

    private Categoria buscarCategoria(Long categoriaId){
        return categoriaRepository.findById(categoriaId).orElseThrow(()->
                new RecursosNoEncontradoException(
                        "Categoria no encontrada con id: "+ categoriaId
                )
        );
    }

    private ProductoResponseDTO convertirResponse(Producto producto){
        return new ProductoResponseDTO(
                producto.getId(),
                producto.getNombre(),
                producto.getPrecio(),
                producto.getStock(),
                producto.getEstado(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre(),
                producto.getFechaCreacion(),
                producto.getFechaModificacion(),
                producto.getCreadoPor(),
                producto.getModificadoPor()
        );
    }
}
