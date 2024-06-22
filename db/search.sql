create or replace function find_user_cards(p_filters jsonb) returns jsonb as
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
    if p_filters ? 'query' then
        query := lower(trim(p_filters ->> 'query'));
    end if;

    if not p_filters ? 'start' or not p_filters ? 'count' then
        raise exception '`start` and `count` are missing';
    end if;

    start := (p_filters -> 'start')::int;
    count := (p_filters -> 'count')::int;

    if p_filters ? 'sort' then
        sort := p_filters ->> 'sort';
    end if;

    sort := case
                when sort = 'activity' then
                    '(albums_contributions + poems_contributions + annotations_contributions)'
                else 'created_at'
            end;

    if p_filters ? 'order' then
        "order" := p_filters ->> 'order';
    end if;

    "order" := case when "order" = 'desc' then 'desc' else 'asc' end;

    sql_query :=
            '
                select jsonb_agg(e)
                from (select jsonb_build_object(''id'', id,
                                                ''first_name'', first_name,
                                                ''last_name'', last_name,
                                                ''nickname'', nickname,
                                                ''avatar'', avatar,
                                                ''roles'', roles,
                                                ''contributions'', (albums_contributions + poems_contributions + annotations_contributions)) e
                      from users
                      where verified = true and (%s)
                      order by %s %s
                      offset %s limit %s) t;
            ';

    if p_filters ? 'query' then
        sql_query := format(sql_query,
                            '
                                lower(nickname) like ''%%'' || $1 || ''%%''
                                or lower(first_name) like ''%%'' || $1 || ''%%''
                                or lower(last_name) like ''%%'' || $1 || ''%%''
                            ', sort, "order", start, count);
        execute sql_query into result using lower(trim(p_filters ->> 'query'));
    else
        sql_query := format(sql_query, 'true', sort, "order", start, count);
        execute sql_query into result;
    end if;

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
                   'id', id,
                   'created_at', created_at,
                   'updated_at', updated_at,
                   'first_name', first_name,
                   'last_name', last_name,
                   'nickname', nickname,
                   'avatar', avatar,
                   'roles', roles,
                   'albums_count', albums_count,
                   'albums_contributions', albums_contributions,
                   'created_poems_count', created_poems_count,
                   'translated_poems_count', translated_poems_count,
                   'poems_contributions', poems_contributions,
                   'annotations_count', annotations_count,
                   'annotations_contributions', annotations_contributions
           )
    into result
    from users
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
                   'id', id,
                   'first_name', first_name,
                   'last_name', last_name,
                   'nickname', nickname,
                   'avatar', avatar,
                   'roles', roles,
                   'contributions', (albums_contributions + poems_contributions + annotations_contributions)
           )
    into result
    from users
    where id = p_id;

    if result is null then
        raise exception 'user not found';
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_reaction(p_post_id integer, p_user_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object('type', type)
    into result
    from reactions
    where post_id = p_post_id
      and user_id = p_user_id;

    if result is null then
        result := '{
          "type": -1
        }'::jsonb;
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_album_cards(p_filters jsonb) returns jsonb as
$$
declare
    start     int  := 0;
    count     int  := 10;
    sort      text := 'new';
    "order"   text := 'asc';
    sql_query text;
    result    jsonb;
begin
    if not p_filters ? 'start' or not p_filters ? 'count' then
        raise exception '`start` and `count` are missing';
    end if;

    start := (p_filters -> 'start')::int;
    count := (p_filters -> 'count')::int;

    if p_filters ? 'sort' then
        sort := p_filters ->> 'sort';
    end if;

    sort := case
                when sort = 'title' then 'title'
                when sort = 'poster' then 'poster ->> ''nickname'''
                when sort = 'author' then 'author ->> ''nickname'''
                when sort = 'publication' then 'publication_date'
                when sort = 'poems_count' then 'poems_count'
                when
                    sort = 'popular'
                    then '(0.3 * contributions_ratio + 0.3 * contributors_ratio + case when reactions = 0 then 0 else 0.4 * (likes / reactions) end)'
                when
                    sort = 'trending'
                    then '(0.7 * (0.3 * contributions_ratio + 0.3 * contributors_ratio + case when reactions = 0 then 0 else 0.4 * (likes / reactions) end) + 0.3 * (extract(epoch from created_at) / extract(epoch from now())))'
                else 'created_at'
            end;

    if p_filters ? 'order' then
        "order" := p_filters ->> 'order';
    end if;

    "order" := case when "order" = 'desc' then 'desc' else 'asc' end;

    sql_query :=
            '
                select jsonb_agg(e)
                from (select jsonb_build_object(''id'', id,
                                                ''created_at'', created_at,
                                                ''updated_at'', updated_at,
                                                ''poster'', poster,
                                                ''author'', author,
                                                ''cover'', cover,
                                                ''title'', title,
                                                ''publication_date'', publication_date,
                                                ''contributors'', contributors,
                                                ''likes'', likes,
                                                ''dislikes'', dislikes,
                                                ''poems_count'', poems_count) e
                      from albums_view
                      where verified = true and (%s)
                      order by %s %s
                      offset %s limit %s) t;
            ';

    if p_filters ? 'userId' then -- when user id is used, query is ignored
        sql_query := format(sql_query,
                            '
                                (author ->> ''id'')::int = $1 or
                                (poster ->> ''id'')::int = $1
                            ', sort, "order", start, count);
        execute sql_query into result using (p_filters ->> 'userId')::int;
    elsif p_filters ? 'query' then
        sql_query := format(sql_query,
                            '
                                lower(author ->> ''nickname'') like ''%%'' || $1 || ''%%''
                                or lower(author ->> ''first_name'') like ''%%'' || $1 || ''%%''
                                or lower(author ->> ''last_name'') like ''%%'' || $1 || ''%%''
                                or lower(poster ->> ''nickname'') like ''%%'' || $1 || ''%%''
                                or lower(poster ->> ''first_name'') like ''%%'' || $1 || ''%%''
                                or lower(poster ->> ''last_name'') like ''%%'' || $1 || ''%%''
                                or lower(title) like ''%%'' || $1 || ''%%''
                            ', sort, "order", start, count);
        execute sql_query into result using lower(trim(p_filters ->> 'query'));
    else
        sql_query := format(sql_query, 'true', sort, "order", start, count);
        execute sql_query into result;
    end if;

    if result is null then
        return '[]'::jsonb;
    end if;

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
                   'cover', cover,
                   'title', title,
                   'publication_date', publication_date,
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

    return result;
end;
$$ language plpgsql;

create or replace function find_poem_cards(p_filters jsonb) returns jsonb as
$$
declare
    start     int  := 0;
    count     int  := 10;
    sort      text := 'new';
    "order"   text := 'asc';
    sql_query text;
    result    jsonb;
begin
    if not p_filters ? 'start' or not p_filters ? 'count' then
        raise exception '`start` and `count` are missing';
    end if;

    start := (p_filters -> 'start')::int;
    count := (p_filters -> 'count')::int;

    if p_filters ? 'sort' then
        sort := p_filters ->> 'sort';
    end if;

    sort := case
                when sort = 'title' then 'title'
                when sort = 'poster' then 'poster ->> ''nickname'''
                when sort = 'author' then 'author ->> ''nickname'''
                when sort = 'publication' then 'publication_date'
                when
                    sort = 'popular'
                    then '(0.3 * contributions_ratio + 0.3 * contributors_ratio + case when reactions = 0 then 0 else 0.4 * (likes / reactions) end)'
                when
                    sort = 'trending'
                    then '(0.7 * (0.3 * contributions_ratio + 0.3 * contributors_ratio + case when reactions = 0 then 0 else 0.4 * (likes / reactions) end) + 0.3 * (extract(epoch from created_at) / extract(epoch from now())))'
                else 'created_at'
            end;

    if p_filters ? 'order' then
        "order" := p_filters ->> 'order';
    end if;

    "order" := case when "order" = 'desc' then 'desc' else 'asc' end;

    sql_query :=
            '
                select jsonb_agg(e)
                from (select jsonb_build_object(''id'', id,
                                                ''created_at'', created_at,
                                                ''updated_at'', updated_at,
                                                ''author'', author,
                                                ''poster'', poster,
                                                ''poem_id'', poem_id,
                                                ''language'', language,
                                                ''cover'', cover,
                                                ''title'', title,
                                                ''publication_date'', publication_date,
                                                ''main_annotation'', main_annotation,
                                                ''contributors'', contributors,
                                                ''likes'', likes,
                                                ''dislikes'', dislikes) e
                      from poems_view
                      where verified = true and (%s)
                      order by %s %s
                      offset %s limit %s) t;
            ';

    if p_filters ? 'userId' then -- only one of the following is allowed and the priority stands as follows: userId and then query
        sql_query := format(sql_query,
                            '
                                (author ->> ''id'')::int = $1 or
                                (poster ->> ''id'')::int = $1
                            ', sort, "order", start, count);
        execute sql_query into result using (p_filters ->> 'userId')::int;
    elsif p_filters ? 'query' then
        sql_query := format(sql_query,
                            '
                                lower(author ->> ''nickname'') like ''%%'' || $1 || ''%%''
                                or lower(author ->> ''first_name'') like ''%%'' || $1 || ''%%''
                                or lower(author ->> ''last_name'') like ''%%'' || $1 || ''%%''
                                or lower(poster ->> ''nickname'') like ''%%'' || $1 || ''%%''
                                or lower(poster ->> ''first_name'') like ''%%'' || $1 || ''%%''
                                or lower(poster ->> ''last_name'') like ''%%'' || $1 || ''%%''
                                or lower(title) like ''%%'' || $1 || ''%%''
                            ', sort, "order", start, count);
        execute sql_query into result using lower(trim(p_filters ->> 'query'));
    else
        sql_query := format(sql_query, 'true', sort, "order", start, count);
        execute sql_query into result;
    end if;

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
    select jsonb_agg(e)
    into result
    from (select jsonb_build_object('id', id,
                                    'created_at', created_at,
                                    'updated_at', updated_at,
                                    'author', author,
                                    'poster', poster,
                                    'poem_id', po.poem_id,
                                    'language', language,
                                    'cover', cover,
                                    'title', title,
                                    'publication_date', publication_date,
                                    'main_annotation', main_annotation,
                                    'contributors', contributors,
                                    'likes', likes,
                                    'dislikes', dislikes) e
          from poems_view po
                   join album_poems ap on ap.poem_id = id
          where ap.album_id = p_id) t;

    if result is null then
        return '[]'::jsonb;
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_poem_by_id(p_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_build_object(
                   'id', id,
                   'created_at', created_at,
                   'updated_at', updated_at,
                   'author', author,
                   'poster', poster,
                   'poem_id', poem_id,
                   'language', language,
                   'cover', cover,
                   'title', title,
                   'publication_date', publication_date,
                   'main_annotation', main_annotation,
                   'content', content,
                   'annotations', annotations,
                   'contributors', contributors,
                   'likes', likes,
                   'dislikes', dislikes)
    into result
    from poems_view
    where id = p_id;

    if result is null then
        raise exception 'poem not found';
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_poem_translations(p_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_agg(e)
    into result
    from (select jsonb_build_object('id', id, 'language', language) e
          from poems_view
          where poem_id = p_id
             or id = p_id) t;

    if result is null then
        raise exception 'poem not found'; -- at least one language must be available
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_annotations_metadata_by_poem_id(p_poem_id integer, p_main_annotation_id integer) returns jsonb as
$$
declare
    result jsonb;
begin
    select jsonb_agg(e)
    into result
    from (select jsonb_build_object('id', id,
                                    'offset', "offset",
                                    'length', length) e
          from annotations_view
          where poem_id = p_poem_id
            and id != p_main_annotation_id
          order by "offset") t;

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
    select jsonb_build_object('id', id,
                              'created_at', created_at,
                              'updated_at', updated_at,
                              'poster', poster,
                              'content', content,
                              'contributors', contributors,
                              'likes', likes,
                              'dislikes', dislikes)
    into result
    from annotations_view
    where id = p_annotation_id;

    if result is null then
        raise exception 'annotation not found';
    end if;

    return result;
end;
$$ language plpgsql;