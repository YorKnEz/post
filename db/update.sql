create or replace procedure __update_post(p_id integer) as
$$
begin
    update posts set updated_at = now() where id = p_id;
end;
$$ language plpgsql;

create or replace function update_album(p_id integer, data jsonb) returns jsonb as
$$
declare
    sql_query text;
    updated   integer;
begin

    sql_query = format('
        update albums set
            title = %s,
            publication_date = %s
        where id = %s returning id;
    ',
                       case
                           when data ? 'title' then format('''%s''', data ->> 'title')
                           else 'title'
                       end,
                       case
                           when data ? 'publicationDate'
                               then format('''%s''::timestamp', data ->> 'publicationDate')
                           else 'publication_date'
                       end,
                       p_id
                );
    execute sql_query into updated;

    if updated is null then
        raise exception 'album not found';
    end if;

    call __update_post(p_id);

    return find_album_by_id(p_id);
end;
$$ language plpgsql;