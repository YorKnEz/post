create or replace function find_user_cards(filters jsonb) returns jsonb as
$$
declare
    query     text := '';
    start     int  := 0;
    count     int  := 10;
    sort      text := 'created_at';
    "order"   text := 'asc';
    sql_query text;
    result    jsonb;
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

    sql_query := format('
    select jsonb_agg(e)
    from (select jsonb_build_object(''id'', u.id,
                                    ''first_name'', u.first_name,
                                    ''last_name'', u.last_name,
                                    ''nickname'', u.nickname,
                                    ''roles'', u.roles) e
          from users u
          order by %s %s) t
    where lower(e ->> ''nickname'') like ''%%'' || ''%s'' || ''%%''
       or lower(e ->> ''first_name'') like ''%%'' || ''%s'' || ''%%''
       or lower(e ->> ''last_name'') like ''%%'' || ''%s'' || ''%%''
    offset %s limit %s;
    ', sort, "order", query, query, query, start, count);
    execute sql_query into result;

    if result is null then
        return '[]'::jsonb;
    end if;

    return result;
end;
$$ language plpgsql;

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

    if result is null then
        raise exception 'user not found';
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_user_card_by_id(p_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object(
                   'id', u.id,
                   'first_name', u.first_name,
                   'last_name', u.last_name,
                   'nickname', u.nickname,
                   'roles', u.roles
           )
    into result
    from users u
    where id = p_id;

    if result is null then
        raise exception 'user not found';
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_album_cards(filters jsonb) returns jsonb as
$$
declare
    start     int  := 0;
    count     int  := 10;
    sort      text := 'new';
    "order"   text := 'asc';
    sql_query text;
    result    jsonb;
    album     jsonb;
begin
    if not filters ? 'start' or not filters ? 'count' then
        raise exception '`start` and `count` are missing';
    end if;

    start := (filters -> 'start')::int;
    count := (filters -> 'count')::int;

    if filters ? 'sort' and filters ->> 'sort' in ('new', 'poster', 'title', 'author', 'publication', 'poems') then
        sort := filters ->> 'sort';
    end if;

    if filters ? 'order' and filters ->> 'order' in ('asc', 'desc') then
        "order" := filters ->> 'order';
    end if;

    sql_query := format(
            '
                select jsonb_agg(e)
                from (select jsonb_build_object(''id'', id,
                                                ''created_at'', created_at,
                                                ''updated_at'', updated_at,
                                                ''poster'', poster,
                                                ''author'', author,
                                                ''title'', title,
                                                ''publication_date'', publication_date,
                                                ''views'', views,
                                                ''contributors'', contributors,
                                                ''likes'', likes,
                                                ''dislikes'', dislikes,
                                                ''poems_count'', poems_count) e
                      from albums_view
                      where verified = true and (%s)
                      order by %s %s
                      offset %s limit %s) t;
            ',
            case -- when user id is used, query is ignored
                when filters ? 'userId' then format(
                        '
                            (author ->> ''id'')::int = %1$s or
                            (poster ->> ''id'')::int = %1$s
                        ', filters ->> 'userId')
                when filters ? 'query' then format(
                        '
                            lower(author ->> ''nickname'') like ''%%'' || ''%1$s'' || ''%%''
                            or lower(author ->> ''first_name'') like ''%%'' || ''%1$s'' || ''%%''
                            or lower(author ->> ''last_name'') like ''%%'' || ''%1$s'' || ''%%''
                            or lower(poster ->> ''nickname'') like ''%%'' || ''%1$s'' || ''%%''
                            or lower(poster ->> ''first_name'') like ''%%'' || ''%1$s'' || ''%%''
                            or lower(poster ->> ''last_name'') like ''%%'' || ''%1$s'' || ''%%''
                        ', lower(trim(filters ->> 'query')))
                else 'true'
            end,
            case
                when sort = 'title' then 'title'
                when sort = 'poster' then 'poster ->> ''nickname'''
                when sort = 'author' then 'author ->> ''nickname'''
                when sort = 'publication' then 'publication_date'
                when sort = 'poems_count' then 'poems_count'
                when sort = 'popular' then '()'
                else 'created_at'
            end, "order",
            start, count
                 );
    execute sql_query into result;

    if result is null then
        return '[]'::jsonb;
    end if;

    -- update views on albums fetched (the views are incremented post fetching, so the user will not see "their view"
    update posts set views = views + 1 where id in (select (jsonb_array_elements(result) ->> 'id')::int);

    return result;
end;
$$ language plpgsql;

create or replace function find_album_by_id(p_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object(
                   'id', id,
                   'created_at', created_at,
                   'updated_at', updated_at,
                   'poster', poster,
                   'author', author,
                   'title', title,
                   'publication_date', publication_date,
                   'views', views,
                   'contributors', contributors,
                   'likes', likes,
                   'dislikes', dislikes,
                   'poems', find_poem_cards_by_album_id(id))
    into result
    from albums_view
    where id = p_id;

    if result is null then
        raise exception 'album not found';
    end if;

    -- update views on albums fetched (the views are incremented post fetching, so the user will not see "their view"
    update posts set views = views + 1 where id = (result ->> 'id')::int;

    return result;
end;
$$ language plpgsql;

select find_album_by_id(1);

-- TODO
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

create or replace function find_poems_by_user_id(p_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object('id', p.id,
                              'created_at', p.created_at,
                              'updated_at', p.updated_at,
                              'poster', find_user_card_by_id(p.poster_id),
                              'author', find_user_card_by_id(po.author_id),
                              'title', po.title,
                              'publication_date', po.publication_date)
    into result
    from poems po
             join posts p on po.id = p.id
    where po.author_id = p_id
       or p.poster_id = p_id;

    if result is null then
        return '[]'::jsonb;
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_poem_cards_by_album_id(p_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object('id', p.id,
                              'created_at', p.created_at,
                              'updated_at', p.updated_at,
                              'poster', find_user_card_by_id(p.poster_id),
                              'author', find_user_card_by_id(po.author_id),
                              'title', po.title,
                              'publication_date', po.publication_date)
    into result
    from poems po
             join posts p on po.id = p.id
             join album_poems ap on ap.poem_id = p.id
    where ap.album_id = p_id;

    if result is null then
        return '[]'::jsonb;
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_poem_by_id(p_id integer, p_language text) returns jsonb as
$$
declare
    result jsonb;
    lyrics jsonb;
begin
    lyrics := find_lyrics(p_id, p_language);

    select jsonb_build_object(
                   'id', p.id,
                   'created_at', p.created_at,
                   'updated_at', p.updated_at,
                   'poster', find_user_card_by_id(p.poster_id),
                   'author', find_user_card_by_id(po.author_id),
                   'title', po.title,
                   'publication_date', po.publication_date,
                   'lyrics', lyrics)
    into result
    from poems po
             join posts p on po.id = p.id
    where p.id = p_id;

    if result is null then
        raise exception 'poem not found';
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_lyrics(p_poem_id integer, p_language text) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object('id', l.id,
                              'created_at', p.created_at,
                              'updated_at', p.updated_at,
                              'poster', find_user_card_by_id(p.poster_id),
                              'title', l.title,
                              'content', l.content,
                              'language', l.language,
                              'main_annotation', find_annotation_by_id(l.main_annotation_id),
                              'annotations', find_annotations_by_lyrics_id(l.id, l.main_annotation_id)
           )
    into result
    from lyrics l
             join posts p on p.id = l.id
    where poem_id = p_poem_id
      and language = p_language;

    if result is null then
        raise exception 'lyrics not found';
    end if;

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

create or replace function find_annotation_by_id(p_annotation_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object('id', id, 'content', content)
    into result
    from annotations
    where id = p_annotation_id;

    if result is null then
        raise exception 'annotation not found';
    end if;

    return result;
end;
$$ language plpgsql;