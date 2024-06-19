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

create or replace function add_album(p_data jsonb) returns jsonb as
$$
declare
    album_id integer;
begin
    album_id := __add_post((p_data ->> 'posterId')::int, 'album'::text);

    -- add album
    insert into albums(id, author_id, title, publication_date)
    values (album_id, (p_data ->> 'authorId')::int, p_data ->> 'title', (p_data ->> 'publicationDate')::timestamp);

    return find_album_by_id(album_id);
end;
$$ language plpgsql;

create or replace procedure add_reaction(p_id integer, p_user_id integer, p_type integer) as
$$
begin
    insert into reactions(user_id, post_id, type)
    values (p_user_id, p_id, p_type)
    on conflict(user_id, post_id) do update set type = p_type;
end;
$$ language plpgsql;