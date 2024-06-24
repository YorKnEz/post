create or replace function __add_post(p_user_id integer, p_type text) returns integer as
$$
declare
    post_id integer;
    date    timestamp := now();
begin
    -- add post
    insert into posts (created_at, updated_at, poster_id, type)
    values (date, date, p_user_id, p_type)
    returning id into post_id;

    -- add request
    insert into requests (created_at, updated_at, requester_id, post_id)
    values (date, date, p_user_id, post_id);

    -- add contribution
    insert into contributions (created_at, updated_at, contributor_id, post_id)
    values (date, date, p_user_id, post_id);

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

    -- increment albums_count of user
    update users
    set albums_count         = albums_count + 1,
        albums_contributions = albums_contributions + 1
    where id = p_poster_id;

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
    select (add_main_annotation(l_poem_id, p_poster_id,
                           jsonb_build_object('content', p_data ->> 'about', 'offset', 0, 'length', 0)) ->> 'id')::int
    into annotation_id;

    -- update poem
    update poems set main_annotation_id = annotation_id where id = l_poem_id;

    -- increment poems_count of user
    if not p_data ? 'poemId' then
        update users
        set created_poems_count = created_poems_count + 1,
            poems_contributions = poems_contributions + 1
        where id = p_poster_id;
    else
        update users
        set translated_poems_count = translated_poems_count + 1,
            poems_contributions    = poems_contributions + 1
        where id = p_poster_id;
    end if;

    return find_poem_by_id(l_poem_id);
end;
$$ language plpgsql;

create or replace function add_main_annotation(p_poem_id integer, p_poster_id integer, p_data jsonb) returns jsonb as
$$
declare
    annotation_id integer;
    date    timestamp := now();
begin
    -- add post
    insert into posts (created_at, updated_at, poster_id, type, verified)
    values (date, date, p_poster_id, 'annotation', true)
    returning id into annotation_id;

    -- add contribution
    insert into contributions (created_at, updated_at, contributor_id, post_id)
    values (date, date, p_poster_id, annotation_id);

    -- add annotation
    insert into annotations(id, poem_id, content, "offset", length)
    values (annotation_id, p_poem_id, p_data ->> 'content', (p_data ->> 'offset')::int,
            (p_data ->> 'length')::int);

    -- increment annotations_count of user
    update users
    set annotations_count         = annotations_count + 1,
        annotations_contributions = annotations_contributions + 1
    where id = p_poster_id;

    return find_annotation_by_id(annotation_id);
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

    -- increment annotations_count of user
    update users
    set annotations_count         = annotations_count + 1,
        annotations_contributions = annotations_contributions + 1
    where id = p_poster_id;

    return find_annotation_by_id(annotation_id);
end;
$$ language plpgsql;