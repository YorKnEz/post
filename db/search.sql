create or replace function find_user_by_id(p_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object(
                   'id', u.id,
                   'created_at', u.created_at,
                   'updated_at', u.updated_at,
                   'first_name', u.first_name,
                   'last_name', u.last_name,
                   'nickname', u.nickname,
                   'roles', u.roles,
                   'albums_count', u.albums_count,
                   'albums_contributions', u.albums_contributions,
                   'poems_count', u.poems_count,
                   'poems_contributions', u.poems_contributions,
                   'created_lyrics_count', u.created_lyrics_count,
                   'translated_lyrics_count', u.translated_lyrics_count,
                   'lyrics_contributions', u.lyrics_contributions,
                   'annotations_count', u.annotations_count,
                   'annotations_contributions', u.annotations_contributions
           )
    into result
    from users u
    where id = p_id;
    return result;
end;
$$ language plpgsql;

create or replace function find_users(filters jsonb) returns refcursor as
$$
declare
    query     text := '';
    start     int  := 0;
    count     int  := 10;
    sort      text := 'created_at';
    "order"   text := 'asc';
    sql_query text;
    cursor    refcursor;
begin
    if filters ? 'query' then
        query := lower(trim(filters ->> 'query'));
    end if;

    if not filters ? 'start' or not filters ? 'count' then
        raise exception '`start` and `count` are missing';
    end if;

    start := (filters -> 'start')::int;
    count := (filters -> 'count')::int;

    if filters ? 'sort' and filters ->> 'sort' in ('new', 'activity') then
        sort := filters ->> 'sort';
        sort := case
                    when sort = 'activity' then
                        '(u.albums_contributions + u.poems_contributions + u.lyrics_contributions + u.annotations_contributions)'
                    else 'created_at'
                end;
    end if;

    if filters ? 'order' and filters ->> 'order' in ('asc', 'desc') then
        "order" := filters ->> 'order';
    end if;

    sql_query := format(
            'select u.id,
                           u.created_at,
                           u.updated_at,
                           u.first_name,
                           u.last_name,
                           u.nickname,
                           u.roles,
                           u.albums_count,
                           u.albums_contributions,
                           u.poems_count,
                           u.poems_contributions,
                           u.created_lyrics_count,
                           u.translated_lyrics_count,
                           u.lyrics_contributions,
                           u.annotations_count,
                           u.annotations_contributions
                    from users u
                    where lower(u.nickname) like ''%%'' || ''%s'' || ''%%''
                       or lower(u.first_name) like ''%%'' || ''%s'' || ''%%''
                       or lower(u.last_name) like ''%%'' || ''%s'' || ''%%''
                    order by %s %s
                    offset %s limit %s;',
            query, query, query,
            sort, "order", start, count);
    open cursor for execute sql_query;
    return cursor;
end;
$$ language plpgsql;

create or replace function find_album_by_id(p_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object(
                   'id', p.id,
                   'created_at', p.created_at,
                   'updated_at', p.updated_at,
                   'poster', jsonb_build_object(
                           'first_name', u2.first_name,
                           'last_name', u2.last_name,
                           'nickname', u2.nickname,
                           'roles', u2.roles
                             ),
                   'author', jsonb_build_object(
                           'first_name', u1.first_name,
                           'last_name', u1.last_name,
                           'nickname', u1.nickname,
                           'roles', u1.roles
                             ),
                   'title', a.title,
                   'publication_date', a.publication_date,
                   'poems', (select count(*) from album_poems where album_id = p.id))
    into result
    from albums a
             join posts p on a.id = p.id
             join users u1 on p.poster_id = u1.id
             join users u2 on a.author_id = u2.id
    where p.id = p_id;
    return result;
end;
$$ language plpgsql;

create or replace function find_albums_by_user_id(p_id integer) returns refcursor as
$$
declare
    cursor refcursor;
begin
    open cursor for select p.id,
                           p.created_at,
                           p.updated_at,
                           jsonb_build_object(
                                   'first_name', u2.first_name,
                                   'last_name', u2.last_name,
                                   'nickname', u2.nickname,
                                   'roles', u2.roles
                           )                                                        poster,
                           jsonb_build_object(
                                   'first_name', u1.first_name,
                                   'last_name', u1.last_name,
                                   'nickname', u1.nickname,
                                   'roles', u1.roles
                           )                                                        author,
                           a.title,
                           a.publication_date,
                           (select count(*) from album_poems where album_id = p.id) poems
                    from albums a
                             join posts p on a.id = p.id
                             join users u1 on p.poster_id = u1.id
                             join users u2 on a.author_id = u2.id
                    where a.author_id = p_id
                       or p.poster_id = p_id;
    return cursor;
end;
$$ language plpgsql;

create or replace function find_albums(filters jsonb) returns refcursor as
$$
declare
    query     text := '';
    start     int  := 0;
    count     int  := 10;
    sort      text := 'new';
    "order"   text := 'asc';
    sql_query text;
    cursor    refcursor;
begin
    if filters ? 'query' then
        query := lower(trim(filters ->> 'query'));
    end if;

    if not filters ? 'start' or not filters ? 'count' then
        raise exception '`start` and `count` are missing';
    end if;

    start := (filters -> 'start')::int;
    count := (filters -> 'count')::int;

    raise notice '%d %d', start, count;

    if filters ? 'sort' and filters ->> 'sort' in ('new', 'poster', 'title', 'author', 'publication', 'poems') then
        sort := filters ->> 'sort';
    end if;

    if filters ? 'order' and filters ->> 'order' in ('asc', 'desc') then
        "order" := filters ->> 'order';
    end if;

    sql_query := format(
            'select p.id,
                p.created_at,
                p.updated_at,
                jsonb_build_object(
                    ''first_name'', u2.first_name,
                    ''last_name'', u2.last_name,
                    ''nickname'', u2.nickname,
                    ''roles'', u2.roles
                ) poster,
                jsonb_build_object(
                    ''first_name'', u1.first_name,
                    ''last_name'', u1.last_name,
                    ''nickname'', u1.nickname,
                    ''roles'', u1.roles
                ) author,
                a.title,
                a.publication_date,
                (select count(*) from album_poems where album_id = p.id) poems
            from albums a
                join posts p on a.id = p.id
                join users u1 on p.poster_id = u1.id
                join users u2 on a.author_id = u2.id
            where (lower(u1.nickname) like ''%%'' || ''%s'' || ''%%''
                or lower(u1.first_name) like ''%%'' || ''%s'' || ''%%''
                or lower(u1.last_name) like ''%%'' || ''%s'' || ''%%''
                or lower(u2.nickname) like ''%%'' || ''%s'' || ''%%''
                or lower(u2.first_name) like ''%%'' || ''%s'' || ''%%''
                or lower(u2.last_name) like ''%%'' || ''%s'' || ''%%''
                or lower(a.title) like ''%%'' || ''%s'' || ''%%'')
                and p.verified = 1
            order by %s %s
            offset %s limit %s;',
            query, query, query, query, query, query, query,
            case
                when sort = 'poster' then 'u2.nickname'
                when sort = 'title' then 'a.title'
                when sort = 'author' then 'u1.nickname'
                when sort = 'publication' then 'a.publication_date'
                when sort = 'poems' then 'poems'
                else 'created_at'
            end, "order", start, count);
    open cursor for execute sql_query;
    return cursor;
end;
$$ language plpgsql;

create or replace function find_poem_by_id(p_id integer, p_language text) returns jsonb as
$$
declare
    result jsonb;
    lyrics jsonb;
begin
    lyrics := find_lyrics(p_id, p_language);

    if lyrics is null then
        return result;
    end if;

    select jsonb_build_object(
                   'id', p.id,
                   'created_at', p.created_at,
                   'updated_at', p.updated_at,
                   'poster', jsonb_build_object(
                           'first_name', u2.first_name,
                           'last_name', u2.last_name,
                           'nickname', u2.nickname,
                           'roles', u2.roles
                             ),
                   'author', jsonb_build_object(
                           'first_name', u1.first_name,
                           'last_name', u1.last_name,
                           'nickname', u1.nickname,
                           'roles', u1.roles
                             ),
                   'title', po.title,
                   'publication_date', po.publication_date,
                   'lyrics', lyrics)
    into result
    from poems po
             join posts p on po.id = p.id
             join users u1 on p.poster_id = u1.id
             join users u2 on po.author_id = u2.id
    where p.id = p_id;
    return result;
end;
$$ language plpgsql;

create or replace function find_lyrics(p_poem_id integer, p_language text) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object('id', id, 'title', title, 'content', content, 'language', language, 'main_annotation',
                              find_annotation_by_id(main_annotation_id), 'annotations',
                              find_annotations_by_lyrics_id(id, main_annotation_id))
    into result
    from lyrics
    where poem_id = p_poem_id
      and language = p_language;
    return result;
end;
$$ language plpgsql;

create or replace function find_annotation_by_id(p_annotation_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object('id', id, 'content', content)
    into result
    from annotations
    where id = p_annotation_id;
    return result;
end;
$$ language plpgsql;

create or replace function find_annotations_by_lyrics_id(p_lyrics_id integer, p_main_annotation_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_agg(jsonb_build_object('id', id, 'offset', "offset", 'length', length))
    into result
    from (select *
          from annotations
          where lyrics_id = p_lyrics_id
            and id != p_main_annotation_id
          order by "offset") ann;

    if result is null then
        result := '[]'::jsonb;
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_poems_by_user_id(p_id integer) returns refcursor as
$$
declare
    cursor refcursor;
begin
    open cursor for select p.id,
                           p.created_at,
                           p.updated_at,
                           jsonb_build_object(
                                   'first_name', u2.first_name,
                                   'last_name', u2.last_name,
                                   'nickname', u2.nickname,
                                   'roles', u2.roles
                           ) poster,
                           jsonb_build_object(
                                   'first_name', u1.first_name,
                                   'last_name', u1.last_name,
                                   'nickname', u1.nickname,
                                   'roles', u1.roles
                           ) author,
                           po.title,
                           po.publication_date
                    from poems po
                             join posts p on po.id = p.id
                             join users u1 on p.poster_id = u1.id
                             join users u2 on po.author_id = u2.id
                    where po.author_id = p_id
                       or p.poster_id = p_id;
    return cursor;
end;
$$ language plpgsql;

create or replace function find_poems(filters jsonb) returns refcursor as
$$
declare
    query     text := '';
    start     int  := 0;
    count     int  := 10;
    sort      text := 'new';
    "order"   text := 'asc';
    sql_query text;
    cursor    refcursor;
begin
    if filters ? 'query' then
        query := lower(trim(filters ->> 'query'));
    end if;

    if not filters ? 'start' or not filters ? 'count' then
        raise exception '`start` and `count` are missing';
    end if;

    start := (filters -> 'start')::int;
    count := (filters -> 'count')::int;

    raise notice '%d %d', start, count;

    if filters ? 'sort' and filters ->> 'sort' in ('new', 'poster', 'title', 'author', 'publication') then
        sort := filters ->> 'sort';
    end if;

    if filters ? 'order' and filters ->> 'order' in ('asc', 'desc') then
        "order" := filters ->> 'order';
    end if;

    sql_query := format(
            'select p.id,
                p.created_at,
                p.updated_at,
                jsonb_build_object(
                    ''first_name'', u2.first_name,
                    ''last_name'', u2.last_name,
                    ''nickname'', u2.nickname,
                    ''roles'', u2.roles
                ) poster,
                jsonb_build_object(
                    ''first_name'', u1.first_name,
                    ''last_name'', u1.last_name,
                    ''nickname'', u1.nickname,
                    ''roles'', u1.roles
                ) author,
                a.title,
                a.publication_date
            from poems a
                join posts p on a.id = p.id
                join users u1 on p.poster_id = u1.id
                join users u2 on a.author_id = u2.id
            where (lower(u1.nickname) like ''%%'' || ''%s'' || ''%%''
                or lower(u1.first_name) like ''%%'' || ''%s'' || ''%%''
                or lower(u1.last_name) like ''%%'' || ''%s'' || ''%%''
                or lower(u2.nickname) like ''%%'' || ''%s'' || ''%%''
                or lower(u2.first_name) like ''%%'' || ''%s'' || ''%%''
                or lower(u2.last_name) like ''%%'' || ''%s'' || ''%%''
                or lower(a.title) like ''%%'' || ''%s'' || ''%%'')
                and p.verified = 1
            order by %s %s
            offset %s limit %s;',
            query, query, query, query, query, query, query,
            case
                when sort = 'poster' then 'u2.nickname'
                when sort = 'title' then 'a.title'
                when sort = 'author' then 'u1.nickname'
                when sort = 'publication' then 'a.publication_date'
                when sort = 'poems' then 'poems'
                else 'created_at'
            end, "order", start, count);
    open cursor for execute sql_query;
    return cursor;
end;
$$ language plpgsql;

--
-- select find_poem_by_id(6, 'en');
-- select find_lyrics(6, 'en');
select find_annotations_by_lyrics_id(25, 26);