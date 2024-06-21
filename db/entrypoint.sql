-- create schema post;

set search_path to post;

create table users
(
    id                        serial primary key,
    created_at                timestamp default now(),
    updated_at                timestamp default now(),
    -- primary information
    first_name                varchar(32),                 -- between 2 and 32 characters
    last_name                 varchar(32),                 -- between 2 and 32 characters
    nickname                  varchar(32) unique not null, -- between 4 and 32 characters
    avatar                    varchar(256)       not null,
    -- auth information
    email                     varchar(256) unique,         -- valid email
    new_email                 varchar(256),                -- valid email
    verified                  boolean   default false,     -- whether or not the account is verified
    password_hash             varchar(256),
    password_salt             varchar(256),
    -- other information
    roles                     integer   default 0,         -- a bitfield: 0b1 - poet, 0b10 - admin
    albums_count              integer   default 0,
    albums_contributions      integer   default 0,
    created_poems_count       integer   default 0,
    translated_poems_count    integer   default 0,
    poems_contributions       integer   default 0,
    annotations_count         integer   default 0,
    annotations_contributions integer   default 0
);

create table posts
(
    id         serial primary key,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    -- primary information
    poster_id  integer   not null,
    type       varchar(16),                      -- one of: album, poem, annotation
    verified   boolean            default false, -- verified by admin, unverified posts are not displayed on the site to regular users
    views      integer            default 0,     -- number of views of the post, incremented by 1 each time it is retrieved from db

    constraint posts_f1 foreign key (poster_id) references users (id)
);

create table contributions
(
    id             serial primary key,
    created_at     timestamp not null default now(),
    updated_at     timestamp not null default now(),
    -- primary information
    contributor_id integer   not null,
    post_id        integer   not null,

    constraint contributions_f1 foreign key (contributor_id) references users (id),
    constraint contributions_f2 foreign key (post_id) references posts (id)
);

create table requests
(
    id           serial primary key,
    created_at   timestamp not null default now(),
    updated_at   timestamp not null default now(),
    -- primary information
    requester_id integer   not null,
    post_id      integer,

    constraint requests_u1 unique (requester_id, post_id),
    constraint requests_f1 foreign key (requester_id) references users (id),
    constraint post_f2 foreign key (post_id) references posts (id)
);

create table reactions
(
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    -- primary information
    post_id    integer,
    user_id    integer,
    type       integer, -- 0 - like, 1 - dislike

    constraint reactions_u1 primary key (post_id, user_id),
    constraint reactions_f1 foreign key (post_id) references posts (id),
    constraint reactions_f2 foreign key (user_id) references users (id)
);

create table albums
(
    id               integer primary key,
    -- primary information
    author_id        integer      not null,
    cover            varchar(256) not null,
    title            varchar(256) not null, -- between 4 and 256 characters
    -- optional
    publication_date timestamp,

    constraint albums_u1 unique (author_id, title),
    constraint albums_f1 foreign key (id) references posts (id),
    constraint albums_f2 foreign key (author_id) references users (id)
);

create table annotations
(
    id       integer primary key,
    -- primary information
    poem_id  integer not null,
    content  varchar not null, -- between 16 and 4000 characters
    "offset" integer not null, -- 0 <= offset, 0 < length, offset + length <= poem_content.length
    length   integer not null, -- [offset, offset + length)

    constraint annotations_f1 foreign key (id) references posts (id)
);

create table poems
(
    id                 integer primary key,
    -- primary information
    author_id          integer      not null,
    poem_id            integer,               -- an id of a poem IF this poem is a translation, otherwise null
    language           varchar(2)   not null, -- exactly 2 characters representing a valid language (!)
    cover              varchar(256) not null,
    title              varchar(256) not null, -- between 4 and 256 characters
    publication_date   timestamp,
    main_annotation_id integer,
    content            varchar      not null, -- between 16 and 4000 characters
    -- optional

    constraint poems_u1 unique (poem_id, language),
    constraint poems_f1 foreign key (id) references posts (id),
    constraint poems_f2 foreign key (poem_id) references poems (id),
    constraint poems_f3 foreign key (main_annotation_id) references annotations (id),
    constraint poems_f4 foreign key (author_id) references users (id)
);

-- add constraint after because poems and annotations reference each other
alter table annotations
    add constraint annotations_f2 foreign key (poem_id) references poems (id);

create table album_poems
(
    album_id integer,
    poem_id  integer,

    constraint album_poems_pk primary key (album_id, poem_id),
    constraint album_poems_f1 foreign key (album_id) references albums (id),
    constraint album_poems_f2 foreign key (poem_id) references poems (id)
);

create table tokens
(
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    value      text primary key,
    user_id    integer   not null,
    type       text      not null, -- session, emailConfirm, emailChange, nicknameChange, passwordChange

    constraint tokens_f1 foreign key (user_id) references users (id)
);

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
                   'avatar', u.avatar,
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

-- views

create or replace view albums_view as
select p.id,
       p.created_at,
       p.updated_at,
       find_user_card_by_id(p.poster_id)                                                  poster,
       find_user_card_by_id(a.author_id)                                                  author,
       p.verified,
       a.cover,
       a.title,
       a.publication_date,
       (select count(*) from contributions where post_id = a.id)                          contributions,
       (select count(*)::numeric from contributions where post_id = a.id) /
       (select max(contributions)::numeric
        from (select count(post_id) contributions from contributions group by post_id) t) contributions_ratio,
       (select count(distinct contributor_id) from contributions where post_id = a.id)    contributors,
       (select count(distinct contributor_id)::numeric from contributions where post_id = a.id) /
       (select max(contributors)::numeric
        from (select count(distinct contributor_id) contributors
              from contributions
              group by post_id) t)                                                        contributors_ratio,
       (select count(*)::numeric from reactions where post_id = a.id)                     reactions,
       (select count(*)::numeric from reactions where post_id = a.id and type = 0)        likes,
       (select count(*)::numeric from reactions where post_id = a.id and type = 1)        dislikes,
       (select count(*)::numeric from album_poems where album_id = a.id)                  poems_count
from albums a
         join posts p on p.id = a.id;

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

create or replace view poems_view as
select p.id,
       p.created_at,
       p.updated_at,
       p.verified,
       find_user_card_by_id(po.author_id)                                                 author,
       find_user_card_by_id(p.poster_id)                                                  poster,
       po.poem_id,
       po.language,
       po.cover,
       po.title,
       po.publication_date,
       find_annotation_by_id(po.main_annotation_id)                                       main_annotation,
       po.content,
       find_annotations_metadata_by_poem_id(p.id, po.main_annotation_id)                  annotations,
       (select count(*) from contributions where post_id = po.id)                         contributions,
       (select count(*)::numeric from contributions where post_id = po.id) /
       (select max(contributions)::numeric
        from (select count(post_id) contributions from contributions group by post_id) t) contributions_ratio,
       (select count(distinct contributor_id) from contributions where post_id = po.id)   contributors,
       (select count(distinct contributor_id)::numeric from contributions where post_id = po.id) /
       (select max(contributors)::numeric
        from (select count(distinct contributor_id) contributors
              from contributions
              group by post_id) t)                                                        contributors_ratio,
       (select count(*)::numeric from reactions where post_id = po.id)                    reactions,
       (select count(*)::numeric from reactions where post_id = po.id and type = 0)       likes,
       (select count(*)::numeric from reactions where post_id = po.id and type = 1)       dislikes
from poems po
         join posts p on p.id = po.id;

create or replace view annotations_view as
select p.id,
       p.created_at,
       p.updated_at,
       find_user_card_by_id(p.poster_id)                                                  poster,
       p.verified,
       a.poem_id,
       a.content,
       a.offset,
       a.length,
       (select count(*) from contributions where post_id = a.id)                          contributions,
       (select count(*)::numeric from contributions where post_id = a.id) /
       (select max(contributions)::numeric
        from (select count(post_id) contributions from contributions group by post_id) t) contributions_ratio,
       (select count(distinct contributor_id) from contributions where post_id = a.id)    contributors,
       (select count(distinct contributor_id)::numeric from contributions where post_id = a.id) /
       (select max(contributors)::numeric
        from (select count(distinct contributor_id) contributors
              from contributions
              group by post_id) t)                                                        contributors_ratio,
       (select count(*)::numeric from reactions where post_id = a.id)                     reactions,
       (select count(*)::numeric from reactions where post_id = a.id and type = 0)        likes,
       (select count(*)::numeric from reactions where post_id = a.id and type = 1)        dislikes
from annotations a
         join posts p on p.id = a.id;

-- search

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

    if p_filters ? 'sort' and p_filters ->> 'sort' in ('new', 'activity') then
        sort := p_filters ->> 'sort';
        sort := case
                    when sort = 'activity' then
                        '(u.albums_contributions + u.poems_contributions + u.annotations_contributions)'
                    else 'created_at'
                end;
    end if;

    if p_filters ? 'order' and p_filters ->> 'order' in ('asc', 'desc') then
        "order" := p_filters ->> 'order';
    end if;

    sql_query := format('
    select jsonb_agg(e)
    from (select jsonb_build_object(''id'', u.id,
                                    ''first_name'', u.first_name,
                                    ''last_name'', u.last_name,
                                    ''nickname'', u.nickname,
                                    ''avatar'', u.avatar,
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
                   'avatar', u.avatar,
                   'roles', u.roles,
                   'albums_count', u.albums_count,
                   'albums_contributions', u.albums_contributions,
                   'created_poems_count', u.created_poems_count,
                   'translated_poems_count', u.translated_poems_count,
                   'poems_contributions', u.poems_contributions,
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

-- insert

create or replace function __add_post(p_user_id integer, p_type text) returns integer as
$$
declare
    post_id integer;
begin
    -- add post
    insert into posts (created_at, updated_at, poster_id, type)
    values (now(), now(), p_user_id, p_type)
    returning id into post_id;

    -- add request
    insert into requests (created_at, updated_at, requester_id, post_id)
    values (now(), now(), p_user_id, post_id);

    -- add contribution
    insert into contributions (created_at, updated_at, contributor_id, post_id)
    values (now(), now(), p_user_id, post_id);

    return post_id;
end;
$$ language plpgsql;

create or replace procedure add_reaction(p_id integer, p_user_id integer, p_type integer) as
$$
declare
    exists integer;
begin
    select post_id into exists from reactions where post_id = p_id and user_id = p_user_id and type = p_type;

    if exists is not null then
        raise exception 'already reacted';
    end if;

    insert into reactions(user_id, post_id, type)
    values (p_user_id, p_id, p_type)
    on conflict(user_id, post_id) do update set type = p_type;
end;
$$ language plpgsql;

create or replace function add_album(p_poster_id integer, p_data jsonb) returns jsonb as
$$
declare
    album_id integer;
begin
    album_id := __add_post(p_poster_id, 'album'::text);

    -- add album
    insert into albums(id, author_id, cover, title, publication_date)
    values (album_id, (p_data ->> 'authorId')::int, p_data ->> 'cover', p_data ->> 'title',
            (p_data ->> 'publicationDate')::timestamp);

    return find_album_by_id(album_id);
end;
$$ language plpgsql;

create or replace function add_poem(p_poster_id integer, p_data jsonb) returns jsonb as
$$
declare
    l_poem_id          integer;
    translated_poem_id integer;
    annotation_id      integer;
begin
    l_poem_id := __add_post(p_poster_id, 'poem'::text);

    if not p_data ? 'publicationDate' then
        p_data['publicationDate'] := now()::jsonb;
    end if;

    if not p_data ? 'poemId' then
        translated_poem_id := null;
    else
        translated_poem_id := (p_data ->> 'poemId')::int;
    end if;

    -- add poem
    insert into poems(id, author_id, poem_id, language, cover, title, publication_date, content)
    values (l_poem_id, (p_data ->> 'authorId')::int, translated_poem_id, p_data ->> 'language', p_data ->> 'cover',
            p_data ->> 'title',
            (p_data ->> 'publicationDate')::timestamp, p_data ->> 'content');

    -- add main annotation
    select (add_annotation(l_poem_id, p_poster_id,
                           jsonb_build_object('content', p_data ->> 'about', 'offset', 0, 'length', 0)) ->> 'id')::int
    into annotation_id;

    -- update poem
    update poems set main_annotation_id = annotation_id where id = l_poem_id;

    return find_poem_by_id(l_poem_id);
end;
$$ language plpgsql;

create or replace function add_annotation(p_poem_id integer, p_poster_id integer, p_data jsonb) returns jsonb as
$$
declare
    annotation_id integer;
begin
    annotation_id := __add_post(p_poster_id, 'annotation'::text);

    -- add annotation
    insert into annotations(id, poem_id, content, "offset", length)
    values (annotation_id, p_poem_id, p_data ->> 'content', (p_data ->> 'offset')::int,
            (p_data ->> 'length')::int);

    return find_annotation_by_id(annotation_id);
end;
$$ language plpgsql;

-- update

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

-- delete

create or replace procedure delete_user(p_user_id integer)
    language plpgsql as
$$
declare
    temprow record;
    deleted int;
begin
    for temprow in (select id, type from posts where poster_id = p_user_id) loop
        case
            when temprow.type = 'album' then call delete_album(temprow.id);
            when temprow.type = 'poem' then call delete_poem(temprow.id);
            when temprow.type = 'annotation' then call delete_annotation(temprow.id);
        end case;
    end loop;

    delete from contributions where contributor_id = p_user_id;
    delete from requests where requester_id = p_user_id;
    delete from reactions where user_id = p_user_id;
    delete from users where id = p_user_id returning id into deleted;

    if deleted is null then
        raise exception 'user not found';
    end if;
end;
$$;

create or replace procedure delete_reaction(p_post_id integer, p_user_id integer, p_type integer)
    language plpgsql as
$$
declare
    deleted integer;
begin
    select id into deleted from posts where id = p_post_id;

    if deleted is null then
        raise exception 'post not found';
    end if;

    delete
    from reactions
    where post_id = p_post_id
      and user_id = p_user_id
      and type = p_type
    returning post_id into deleted;

    if deleted is null then
        raise exception 'reaction not found';
    end if;
end;
$$;

create or replace procedure __delete_post(p_post_id integer)
    language plpgsql as
$$
begin
    delete from contributions where post_id = p_post_id;
    delete from requests where post_id = p_post_id;
    delete from reactions where post_id = p_post_id;
    delete from posts where id = p_post_id;
end;
$$;

create or replace procedure delete_annotation(p_annotation_id integer)
    language plpgsql as
$$
declare
    deleted int;
begin
    -- delete annotation
    delete from annotations where id = p_annotation_id returning id into deleted;

    if deleted is null then
        raise exception 'annotation not found';
    end if;

    -- delete post that it referenced
    call __delete_post(p_annotation_id);
end;
$$;

create or replace procedure delete_poem(p_poem_id integer)
    language plpgsql as
$$
declare
    temprow record;
    deleted int;
begin
    update poems set main_annotation_id = null where id = p_poem_id returning id into deleted;

    if deleted is null then
        raise exception 'poem not found';
    end if;

    -- delete annotations
    for temprow in select id from annotations where poem_id = p_poem_id
    loop
        call delete_annotation(temprow.id);
    end loop;

    -- delete album_poems connections
    delete from album_poems where poem_id = p_poem_id;

    -- delete translations
    for temprow in select id from poems where poem_id = p_poem_id
    loop
        call delete_poem(temprow.id);
    end loop;

    -- delete poem
    delete from poems where id = p_poem_id returning id into deleted;

    -- delete post that it referenced
    call __delete_post(p_poem_id);
end;
$$;

create or replace procedure delete_album(p_album_id integer)
    language plpgsql as
$$
declare
    deleted int;
begin
    -- delete album_poems connections
    delete from album_poems where album_id = p_album_id;

    -- delete album
    delete from albums where id = p_album_id returning id into deleted;

    if deleted is null then
        raise exception 'album not found';
    end if;

    -- delete post that it referenced
    call __delete_post(p_album_id);
end;
$$;
