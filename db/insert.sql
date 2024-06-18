create or replace function __add_post(user_id integer, post_type text) returns integer as
$$
declare
    post_id integer;
begin
    -- add post
    insert into posts (created_at, updated_at, poster_id, type)
    values (now(), now(), user_id, post_type)
    returning id into post_id;

    -- add request
    insert into requests (created_at, updated_at, requester_id, post_id)
    values (now(), now(), user_id, post_id);

    -- add contribution
    insert into contributions (created_at, updated_at, contributor_id, post_id)
    values (now(), now(), user_id, post_id);

    return post_id;
end;
$$ language plpgsql;

create or replace function add_album(data jsonb) returns jsonb as
$$
declare
    album_id integer;
begin
    album_id := add_post((data ->> 'posterId')::int, 'album'::text);

    -- add album
    insert into albums(id, author_id, title, publication_date)
    values (album_id, (data ->> 'authorId')::int, data ->> 'title', (data ->> 'publicationDate')::timestamp);

    return find_album_by_id(album_id);
end;
$$ language plpgsql;