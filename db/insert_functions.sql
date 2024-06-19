create or replace function insert_user(in_json jsonb)
    returns varchar as
$$
declare
    err_alphanum text := 'must only contain letters and numbers.';
    err_invalid  text := 'is invalid.';
    reg_at       text := '^.+@.+$';
begin
    if not is_alphanumeric(in_json ->> 'first_name') then
        raise exception 'First name %s', err_alphanum;
    end if;
    if not is_alphanumeric(in_json ->> 'last_name') then
        raise exception 'Last name %s', err_alphanum;
    end if;
    if not is_alphanumeric(in_json ->> 'nickname') then
        raise exception 'Nickname %s', err_alphanum;
    end if;
    if not is_matching(in_json ->> 'email', reg_at) then
        raise exception 'Email %s', err_invalid;
    end if;
    if not ('0' <= cast(in_json ->> 'roles' as integer) and cast(in_json ->> 'roles' as integer) <= '3') then
        raise exception 'Role %s', err_invalid;
    end if;

    insert into users (created_at, updated_at, first_name, last_name, nickname, email, verified,
                       password_hash, password_salt, roles,
                       albums_count, albums_contributions, poems_count,
                       poems_contributions, created_lyrics_count, translated_lyrics_count,
                       lyrics_contributions, annotations_count, annotations_contributions)
    values (now(), now(), in_json ->> 'first_name', in_json ->> 'last_name', in_json ->> 'nickname',
            in_json ->> 'email',
            cast(in_json ->> 'verified' as integer), in_json ->> 'password_hash', in_json ->> 'password_salt',
            cast(in_json ->> 'roles' as integer),
            cast(in_json ->> 'albums_count' as integer), cast(in_json ->> 'albums_contributions' as integer),
            cast(in_json ->> 'poems_count' as integer),
            cast(in_json ->> 'poems_contributions' as integer), cast(in_json ->> 'created_lyrics_count' as integer),
            cast(in_json ->> 'translated_lyrics_count' as integer),
            cast(in_json ->> 'lyrics_contributions' as integer), cast(in_json ->> 'annotations_count' as integer),
            cast(in_json ->> 'annotations_contributions' as integer));

    return 'Insert succsessful.';
end;
$$ language plpgsql;

-- select insert_user('{
--     "first_name": "George",
--     "last_name": "Rotariu",
--     "nickname": "jelly",
--     "email": "rotariu0@gmail.com",
--     "roles": 3,
--     "password_hash": "pwhash",
--     "password_salt": "pwsalt",
--     "roles": 1,
-- }'::json);

create or replace procedure add_post(user_id integer, post_type text, verified integer, out post_id integer) as
$$
declare
    err_invalid text := 'is invalid.';
begin
    if not post_type in ('album', 'poem', 'lyrics', 'annotation') then
        post_id := -1;
    end if;

    insert into posts (created_at, updated_at, poster_id, type, verified)
    values (now(), now(), user_id, post_type, verified)
    returning id into post_id;

    if verified = 0 then
        insert into requests (created_at, updated_at, requester_id, post_id)
        values (now(), now(), user_id, post_id);
    else
        insert into contributions (created_at, updated_at, contributor_id, post_id)
        values (now(), now(), user_id, post_id);
        --update the stats
    end if;
end;
$$ language plpgsql;

create or replace function insert_album(in_json JSON)
    returns varchar as
$$
declare
    err_alphanum text := 'must only contain letters and numbers.';
    err_invalid  text := 'is invalid.';
    post_id      integer;
begin
    if not is_alphanumeric(in_json ->> 'title') then
        return 'Title ' || err_alphanum;
    end if;

    call add_post(cast(in_json ->> 'requester_id' as integer), in_json ->> 'post_type',
                  cast(in_json ->> 'verified' as integer), post_id);

    insert into albums (id, author_id, title, publication_date)
    values (post_id, cast(in_json ->> 'author_id' as integer), in_json ->> 'title',
            cast(in_json ->> 'publication_date' as timestamp));

    return 'Insert succsessful.';
end;
$$ language plpgsql;

select insert_album('{
  "requester_id": 1,
  "post_type": "album",
  "verified": 0,
  "author_id": 5,
  "title": "Om",
  "publication_date": "2024-06-02"
}');

create or replace function link_poem_to_album(in_json JSON)
    returns varchar as
$$
declare
    err_alphanum text := 'must only contain letters and numbers.';
    err_invalid  text := 'is invalid.';
begin

    insert into album_poems (album_id, poem_id)
    values (cast(in_json ->> 'album_id' as integer), cast(in_json ->> 'poem_id' as integer));

    return 'Insert succsessful.';
end;
$$ language plpgsql;

-- select link_poem_to_album('{
--     "album_id": 1,
--     "poem_id": 7
-- }');

create or replace function add_lyrics(post_id integer, poem_id integer, title text, content text, language text)
    returns varchar as
$$
declare
    post_id integer;
begin
    insert into lyrics (id, poem_id, title, content, language)
    values (post_id, poem_id, title, content, language);

    return 'Insert succsessful.';
end;
$$ language plpgsql;

create or replace function insert_lyrics(in_json JSON)
    returns varchar as
$$
declare
    post_id integer;
begin

    -- if in_json->>'poem_id' = null then
    --     call insert_poem(in_json);
    -- end if;

    call add_post(cast(in_json ->> 'requester_id' as integer), in_json ->> 'post_type',
                  cast(in_json ->> 'verified' as integer), post_id);

    insert into lyrics (id, poem_id, title, content, language)
    values (post_id, cast(in_json ->> 'poem_id' as integer), in_json ->> 'title', in_json ->> 'content',
            in_json ->> 'language');

    return 'Insert succsessful.';
end;
$$ language plpgsql;

-- select insert_lyrics('{
--     "requester_id": 1,
--     "post_type": "lyrics",
--     "verified": 0,
--     "poem_id": 6,
--     "title": "Glossa",
--     "content": "Vreme trece, vreme vine",
--     "language": "ro"
-- }'::json);

create or replace function insert_poem(in_json JSON)
    returns varchar as
$$
declare
    result  text;
    post_id integer;
begin

    call add_post(cast(in_json ->> 'requester_id' as integer), in_json ->> 'post_type',
                  cast(in_json ->> 'verified' as integer), post_id);

    insert into poems (id, author_id, title, publication_date)
    values (post_id, cast(in_json ->> 'author_id' as integer), in_json ->> 'title',
            cast(in_json ->> 'publication_date' as timestamp));

    in_json := jsonb_set(in_json::jsonb, '{poem_id}', to_jsonb(post_id));
    select insert_lyrics(in_json) into result;

    return result;
end;
$$ language plpgsql;

-- select insert_poem('{
--     "requester_id": 1,
--     "post_type": "lyrics",
--     "verified": 0,
--     "author_id": 1,
--     "publication_date": "2024-06-02",
--     "title": "Glossa",
--     "content": "Vreme trece, vreme vine",
--     "language": "ro"
-- }'::json);

create or replace function insert_reaction(in_json JSON)
    returns varchar as
$$
begin

    delete
    from reactions
    where post_id = cast(in_json ->> 'post_id' as integer)
      and user_id = cast(in_json ->> 'user_id' as integer);

    insert into reactions (created_at, updated_at, post_id, user_id, type)
    values (now(), now(), cast(in_json ->> 'post_id' as integer), cast(in_json ->> 'user_id' as integer),
            cast(in_json ->> 'type' as integer));

    return 'Insert succsessful.';
end;
$$ language plpgsql;

-- select insert_reaction('{
--     "post_id": 40,
--     "user_id": 1,
--     "type": 1
-- }'::json);

create or replace function insert_annotation(in_json JSON)
    returns varchar as
$$
declare
    post_id integer;
begin

    call add_post(cast(in_json ->> 'requester_id' as integer), in_json ->> 'post_type',
                  cast(in_json ->> 'verified' as integer), post_id);

    insert into annotations (id, lyrics_id, content, "offset", "length")
    values (post_id, cast(in_json ->> 'lyrics_id' as integer), in_json ->> 'content',
            cast(in_json ->> 'offset' as integer), cast(in_json ->> 'length' as integer));

    return 'Insert succsessful.';
end;
$$ language plpgsql;

select insert_annotation('{
  "requester_id": 1,
  "post_type": "annotation",
  "verified": 0,
  "lyrics_id": 40,
  "content": "con tent",
  "offset": 1,
  "length": 2,
  "publication_date": "2024-06-02"
}'::json);