-- Ejecutar en el esquema de desarrollo tras V4. Requiere una categoría y un cliente.
declare
    categoria number;
    cliente number;
begin
    select min(id) into categoria from categorias;
    select min(id) into cliente from clientes;
    if categoria is null or cliente is null then
        raise_application_error(-20001, 'Cree una categoría y un cliente antes de cargar volumen.');
    end if;

    insert into productos (nombre, precio, stock, estado, categoria_id, fecha_creacion, creado_por)
    select 'Producto de prueba ' || lpad(level, 5, '0'),
           round(dbms_random.value(1, 200), 2), trunc(dbms_random.value(0, 500)),
           true, categoria, systimestamp, 'carga'
    from dual connect by level <= 5000;

    insert into ventas (fecha, total, estado, cliente_id, creado_por)
    select systimestamp - numtodsinterval(dbms_random.value(0, 365), 'DAY'),
           round(dbms_random.value(5, 500), 2), 'REGISTRADA', cliente, 'carga'
    from dual connect by level <= 20000;
    commit;
exception
    when others then
        rollback;
        raise;
end;
/
select count(*) as productos from productos;
select count(*) as ventas from ventas;
