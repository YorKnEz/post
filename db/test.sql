create or replace function test(in_json jsonb, refcursor) returns refcursor as
$$
declare
    name text;
begin
    name := in_json ->> 'name';
    open $2 for
        select * from users where nickname like '%' || name || '%';
    return $2;
end;
$$ language plpgsql;

create or replace function test2(in_json jsonb) returns jsonb as
$$
declare
    name   text;
    result jsonb;
begin
    name := in_json ->> 'name';

    select jsonb_build_object(
                   'id', id,
                   'created_at', created_at,
                   'updated_at', updated_at,
                   'first_name', first_name,
                   'last_name', last_name,
                   'nickname', nickname,
                   'verified', verified,
                   'roles', roles
           )
    into result
    from users
    where nickname like '%' || name || '%'
    limit 1;

    return result;
end;
$$ language plpgsql;

create or replace function test3(in_json jsonb, refcursor) returns refcursor as
$$
declare
    name text := '';
begin
    name := in_json ->> 'name';

    open $2 for
        select jsonb_build_object(
                       'id', id,
                       'created_at', created_at,
                       'updated_at', updated_at,
                       'first_name', first_name,
                       'last_name', last_name,
                       'nickname', nickname,
                       'verified', verified,
                       'roles', roles
               )
        from users
        where nickname like '%' || name || '%';

    return $2;
end;
$$ language plpgsql;