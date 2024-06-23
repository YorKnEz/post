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

create or replace function find_post_cards(p_filters jsonb) returns jsonb as
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
                when sort = 'title' then 'coalesce(av.title, pv.title)'
                when sort = 'poster' then 'coalesce(av.poster ->> ''nickname'', pv.poster ->> ''nickname'')'
                when sort = 'author' then 'coalesce(av.author ->> ''nickname'', pv.author ->> ''nickname'')'
                when sort = 'publication' then 'coalesce(av.publication_date, pv.publication_date)'
                when
                    sort = 'popular'
                    then
                    '
                        coalesce(
                            (0.3 * av.contributions_ratio + 0.3 * av.contributors_ratio + case when av.reactions = 0 then 0 else 0.4 * (av.likes / av.reactions) end),
                            (0.3 * pv.contributions_ratio + 0.3 * pv.contributors_ratio + case when pv.reactions = 0 then 0 else 0.4 * (pv.likes / pv.reactions) end)
                        )
                    '
                when
                    sort = 'trending'
                    then
                    '
                        coalesce(
                            (0.7 * (0.3 * av.contributions_ratio + 0.3 * av.contributors_ratio + case when av.reactions = 0 then 0 else 0.4 * (av.likes / av.reactions) end) + 0.3 * (extract(epoch from av.created_at) / extract(epoch from now()))),
                            (0.7 * (0.3 * pv.contributions_ratio + 0.3 * pv.contributors_ratio + case when pv.reactions = 0 then 0 else 0.4 * (pv.likes / pv.reactions) end) + 0.3 * (extract(epoch from pv.created_at) / extract(epoch from now())))
                        )
                    '
                else 'p.created_at'
            end;

    if p_filters ? 'order' then
        "order" := p_filters ->> 'order';
    end if;

    "order" := case when "order" = 'desc' then 'desc' else 'asc' end;

    sql_query :=
            '
                select jsonb_agg(e)
                from (select case
                                 when p.type = ''album'' then
                                     jsonb_build_object(
                                             ''id'', av.id,
                                             ''type'', p.type,
                                             ''created_at'', av.created_at,
                                             ''updated_at'', av.updated_at,
                                             ''poster'', av.poster,
                                             ''author'', av.author,
                                             ''cover'', av.cover,
                                             ''title'', av.title,
                                             ''publication_date'', av.publication_date,
                                             ''contributors'', av.contributors,
                                             ''likes'', av.likes,
                                             ''dislikes'', av.dislikes,
                                             ''poems_count'', poems_count
                                     )
                                 when p.type = ''poem'' then
                                     jsonb_build_object(
                                             ''id'', pv.id,
                                             ''type'', p.type,
                                             ''created_at'', pv.created_at,
                                             ''updated_at'', pv.updated_at,
                                             ''author'', pv.author,
                                             ''poster'', pv.poster,
                                             ''poem_id'', poem_id,
                                             ''language'', language,
                                             ''cover'', pv.cover,
                                             ''title'', pv.title,
                                             ''publication_date'', pv.publication_date,
                                             ''main_annotation'', main_annotation,
                                             ''contributors'', pv.contributors,
                                             ''likes'', pv.likes,
                                             ''dislikes'', pv.dislikes
                                     )
                             end e
                      from posts p
                               left join albums_view av on av.id = p.id
                               left join poems_view pv on pv.id = p.id
                      where (p.type = ''album'' and av.verified = true) or (p.type = ''poem'' and pv.verified = true) and (%s)
                      order by %s %s
                      offset %s limit %s) t;
            ';

    if p_filters ? 'userId' then -- when user id is used, query is ignored
        sql_query := format(sql_query,
                            '
                                (p.type = ''album'' and (
                                    (av.author ->> ''id'')::int = $1 or (av.poster ->> ''id'')::int = $1
                                ))
                                or
                                (p.type = ''poem'' and (
                                    (pv.author ->> ''id'')::int = $1 or (pv.poster ->> ''id'')::int = $1
                                ))
                            ', sort, "order", start, count);
        execute sql_query into result using (p_filters ->> 'userId')::int;
    elsif p_filters ? 'query' then
        sql_query := format(sql_query,
                            '
                                (p.type = ''album'' and (
                                    lower(av.author ->> ''nickname'') like ''%%'' || $1 || ''%%''
                                    or lower(av.author ->> ''first_name'') like ''%%'' || $1 || ''%%''
                                    or lower(av.author ->> ''last_name'') like ''%%'' || $1 || ''%%''
                                    or lower(av.poster ->> ''nickname'') like ''%%'' || $1 || ''%%''
                                    or lower(av.poster ->> ''first_name'') like ''%%'' || $1 || ''%%''
                                    or lower(av.poster ->> ''last_name'') like ''%%'' || $1 || ''%%''
                                    or lower(av.title) like ''%%'' || $1 || ''%%''
                                ))
                                or
                                (p.type = ''poem'' and (
                                    lower(pv.author ->> ''nickname'') like ''%%'' || $1 || ''%%''
                                    or lower(pv.author ->> ''first_name'') like ''%%'' || $1 || ''%%''
                                    or lower(pv.author ->> ''last_name'') like ''%%'' || $1 || ''%%''
                                    or lower(pv.poster ->> ''nickname'') like ''%%'' || $1 || ''%%''
                                    or lower(pv.poster ->> ''first_name'') like ''%%'' || $1 || ''%%''
                                    or lower(pv.poster ->> ''last_name'') like ''%%'' || $1 || ''%%''
                                    or lower(pv.title) like ''%%'' || $1 || ''%%''
                                ))
                            ', sort, "order", start, count);
        execute sql_query into result using lower(trim(p_filters ->> 'query'));
    else
        sql_query := format(sql_query, 'true', sort, "order", start, count);
        execute sql_query into result;
    end if;

    raise notice '%s', sql_query;

    if result is null then
        return '[]'::jsonb;
    end if;

    return result;
end;
$$ language plpgsql;

create or replace function find_contribution_cards(p_filters jsonb) returns jsonb as
$$
declare
    start  int := 0;
    count  int := 10;
    result jsonb;
begin
    if not p_filters ? 'start' or not p_filters ? 'count' then
        raise exception '`start` and `count` are missing';
    end if;

    start := (p_filters -> 'start')::int;
    count := (p_filters -> 'count')::int;

    select jsonb_agg(e2)
    into result
    from (select jsonb_build_object('date', created_at::date, 'contributions', json_agg(e)) e2
          from (select c.created_at,
                       jsonb_build_object(
                               'id', p.id,
                               'type', p.type,
                               'contribution', case when c.created_at = p.created_at then 'created' else 'edited' end,
                               'created_at', p.created_at,
                               'updated_at', p.updated_at
                       ) ||
                       case
                           when p.type = 'album' then
                               jsonb_build_object(
                                       'poster', av.poster,
                                       'author', av.author,
                                       'cover', av.cover,
                                       'title', av.title,
                                       'publication_date', av.publication_date,
                                       'contributors', av.contributors,
                                       'likes', av.likes,
                                       'dislikes', av.dislikes,
                                       'poems_count', av.poems_count
                               )
                           when p.type = 'poem' then
                               jsonb_build_object(
                                       'author', pv.author,
                                       'poster', pv.poster,
                                       'poem_id', pv.poem_id,
                                       'language', pv.language,
                                       'cover', pv.cover,
                                       'title', pv.title,
                                       'publication_date', pv.publication_date,
                                       'main_annotation', pv.main_annotation,
                                       'contributors', pv.contributors,
                                       'likes', pv.likes,
                                       'dislikes', pv.dislikes
                               )
                           when p.type = 'annotation' then
                               jsonb_build_object(
                                       'poem', find_poem_card_by_id(anv.poem_id),
                                       'poster', anv.poster,
                                       'content', anv.content,
                                       'contributors', anv.contributors,
                                       'likes', anv.likes,
                                       'dislikes', anv.dislikes
                               )
                       end e
                from contributions c
                         join posts p on c.post_id = p.id
                         left join albums_view av on av.id = p.id
                         left join poems_view pv on pv.id = p.id
                         left join annotations_view anv on anv.id = p.id
                where (p_filters ? 'userId' and c.contributor_id = (p_filters ->> 'userId')::int)
                  and (case
                           when p_filters ? 'type' then
                               (case
                                    when (p_filters ->> 'type') = 'pending' then p.verified = false
                                    when (p_filters ->> 'type') in ('album', 'annotation', 'poem')
                                        then p.type = p_filters ->> 'type'
                                    else true
                                end)
                           else true
                       end)
                order by c.created_at desc
                offset start limit count) t
          group by t.created_at::date
          order by t.created_at::date desc) t2;

    if result is null then
        return '[]'::jsonb;
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

create or replace function find_poem_card_by_id(p_id integer) returns jsonb as
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