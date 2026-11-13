package com.example.Actividad01.repository;

import com.example.Actividad01.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    @org.springframework.data.jpa.repository.Modifying(flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("update Producto p set p.stock = p.stock - :cantidad, p.modificadoPor = :usuario, p.fechaModificacion = current_timestamp where p.id = :id and p.estado = true and p.stock >= :cantidad")
    int descontarStock(@org.springframework.data.repository.query.Param("id") Long id,
                       @org.springframework.data.repository.query.Param("cantidad") int cantidad,
                       @org.springframework.data.repository.query.Param("usuario") String usuario);

    @org.springframework.data.jpa.repository.Modifying(flushAutomatically = true)
    @org.springframework.data.jpa.repository.Query("update Producto p set p.stock = p.stock + :cantidad, p.modificadoPor = :usuario, p.fechaModificacion = current_timestamp where p.id = :id")
    int devolverStock(@org.springframework.data.repository.query.Param("id") Long id,
                     @org.springframework.data.repository.query.Param("cantidad") int cantidad,
                       @org.springframework.data.repository.query.Param("usuario") String usuario);
    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "categoria")
    org.springframework.data.domain.Page<Producto> findAll(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "categoria")
    org.springframework.data.domain.Page<Producto> findByNombreContainingIgnoreCaseOrCategoriaNombreContainingIgnoreCase(
            String nombre, String categoria, org.springframework.data.domain.Pageable pageable);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
    List<Producto> findByCategoriaId(Long CategoriaId);

    boolean existsByCategoriaId(Long categoriaId);
}
