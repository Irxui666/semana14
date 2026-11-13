insert into categorias (nombre, estado, fecha_creacion) values ('Analgésicos E2E', true, current_timestamp);
insert into clientes (dni, nombres, apellidos, email, estado, fecha_creacion)
values ('87654321', 'Ana', 'Mamani E2E', 'mamani.e2e@example.test', true, current_timestamp);
insert into productos (nombre, precio, stock, estado, categoria_id, fecha_creacion)
select 'Paracetamol', 12.50, 100, true, id, current_timestamp
from categorias where nombre = 'Analgésicos E2E';
insert into productos (nombre, precio, stock, estado, categoria_id, fecha_creacion)
select concat('Producto E2E ', cast(x as varchar)), 12.50, 100, true, id, current_timestamp
from categorias cross join system_range(1, 42) where nombre = 'Analgésicos E2E';
