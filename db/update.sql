create or replace procedure __update_post(p_id integer, p_user_id integer) as
$$
begin
    update posts set updated_at = now() where id = p_id;

    insert into contributions(contributor_id, post_id) values (p_user_id, p_id);
end;
$$ language plpgsql;

create or replace function update_album(p_id integer, p_user_id integer, p_data jsonb) returns jsonb as
$$
declare
    sql_query text;
    updated   integer;
begin

    sql_query = format('
        update albums set
            cover = %s,
            title = %s,
            publication_date = %s
        where id = %s returning id;
    ',
                       case
                           when p_data ? 'cover' then format('''%s''', p_data ->> 'cover')
                           else 'cover'
                       end,
                       case
                           when p_data ? 'title' then format('''%s''', p_data ->> 'title')
                           else 'title'
                       end,
                       case
                           when p_data ? 'publicationDate'
                               then format('''%s''::timestamp', p_data ->> 'publicationDate')
                           else 'publication_date'
                       end,
                       p_id
                );
    execute sql_query into updated;

    if updated is null then
        raise exception 'album not found';
    end if;

    call __update_post(p_id, p_user_id);

    return find_album_by_id(p_id);
end;
$$ language plpgsql;

create or replace function update_poem(p_id integer, p_user_id integer, p_data jsonb) returns jsonb as
$$
declare
    sql_query text;
    updated   integer;
begin

    sql_query = format('
        update poems set
        cover = %s,
            title = %s,
            publication_date = %s,
            content = %s
        where id = %s returning id;
    ',
                       case
                           when p_data ? 'cover' then format('''%s''', p_data ->> 'cover')
                           else 'cover'
                       end,
                       case
                           when p_data ? 'title' then format('''%s''', p_data ->> 'title')
                           else 'title'
                       end,
                       case
                           when p_data ? 'publicationDate'
                               then format('''%s''::timestamp', p_data ->> 'publicationDate')
                           else 'publication_date'
                       end,
                       case
                           when p_data ? 'content' then format('''%s''', p_data ->> 'content')
                           else 'content'
                       end,
                       p_id
                );
    execute sql_query into updated;

    if updated is null then
        raise exception 'poem not found';
    end if;

    call __update_post(p_id, p_user_id);

    return find_poem_by_id(p_id);
end;
$$ language plpgsql;

create or replace function update_annotation(p_id integer, p_user_id integer, p_data jsonb) returns jsonb as
$$
declare
    sql_query text;
    updated   integer;
begin

    sql_query = format('
        update annotations set
            content = %s
        where id = %s returning id;
    ',
                       case
                           when p_data ? 'content' then format('''%s''', p_data ->> 'content')
                           else 'content'
                       end,
                       p_id
                );
    execute sql_query into updated;

    if updated is null then
        raise exception 'annotation not found';
    end if;

    call __update_post(p_id, p_user_id);

    return find_annotation_by_id(p_id);
end;
$$ language plpgsql;