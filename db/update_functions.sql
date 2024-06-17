-- pentru UPDATE:

-- !!de actualizat updated at de la contributions si posts


-- requests:
-- -daca post id e null => e request de poet
--  => trebuie setat rolul la user ca poet
-- -daca contine post_id => trebuie sa setez verified la postare
-- -la sfarsit trebuie sters requestul
-- posts:
-- -verified

create or replace procedure increment_stat(p_id text, p_stat text) as $$
begin
    execute format('UPDATE users SET %I = %I + 1 WHERE id = %L',
            p_stat, p_stat, p_id);
end;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION accept_request(in_json JSON)
RETURNS varchar AS $$
DECLARE
    v_post_type text;
    v_exists integer;
    v_first_lyric integer;
BEGIN
    select type 
    into v_post_type
    from posts
    where id = cast(in_json->>'id' as integer);

    update posts
    set
    verified = 1
    where id = cast(in_json->>'id' as integer);

    select count(*)
    into v_exists
    from contributions
    where post_id = cast(in_json->>'id' as integer);
    -- v_exists := 'blabla';

    case
        when v_post_type = 'album' then
            if v_exists = 0 then
                call increment_stat(in_json->>'id', 'albums_count');
            end if;
            call increment_stat(in_json->>'id', 'albums_contributions');
        when v_post_type = 'annotations' then
            if v_exists = 0 then
                call increment_stat(in_json->>'id', 'annotations_count');
            end if;
            call increment_stat(in_json->>'id', 'annotations_contributions');
        when v_post_type = 'poem' then
            if v_exists = 0 then
                call increment_stat(in_json->>'id', 'poems_count');
            end if;
            call increment_stat(in_json->>'id', 'poems_contributions');
        when v_post_type = 'lyrics' then
            if v_exists = 0 then
                --if the lyric is the first one created (aka this post represents the creation of the poem)
                --then there is no contribution with post_id = poem_id
                select count(*)
                into v_first_lyric
                from contributions
                where post_id = cast(in_json->>'id' as integer);

                if v_first_lyric = 0 then
                    call increment_stat(in_json->>'id', 'created_lyrics_count');
                else
                    call increment_stat(in_json->>'id', 'translated_lyrics_count');
                end if;
            end if;
            call increment_stat(in_json->>'id', 'lyrics_contributions');
        else
            --nu s-a extras post_type din tabela deoarece post_id e null
            --asta inseamna ca este un request de a deveni poet
            update users
            set
            roles = roles | 1
            from users
            join requests
                on users.id = requests.id
                and requests.id = cast(in_json->>'id' as integer)
            where users.id = requests.requester_id;
    end case;


    delete
    from requests
    where post_id = cast(in_json->>'id' as integer) and requester_id = cast(in_json->>'requester_id' as integer);

    call update_date(in_json);

    insert
    into contributions(
        created_at,
        updated_at,
        contributor_id,
        post_id
    )
    values(
        now(),
        now(),
        cast(in_json->>'requester_id' as integer),
        cast(in_json->>'id' as integer)
    );

    -- v_exists := 'blabla';

    return 'Update succsessful.';
END;
$$ LANGUAGE plpgsql;

-- select accept_request('{
--     "id": 11,
--     "requester_id": 7 
-- }'::json);

-- album:
-- -title
-- -publication_date
-- -author

CREATE OR REPLACE FUNCTION update_album(in_json JSON)
RETURNS varchar AS $$
DECLARE
    err_alphanum text := 'must only contain letters and numbers.';
    err_invalid text := 'is invalid.';
BEGIN
    if not is_alphanumeric(in_json->>'title') then
        return 'Title ' || err_alphanum;
    end if;

    update albums
    set
    author_id = coalesce(cast(in_json->>'author_id' as integer), author_id),
    title = coalesce(in_json->>'title', title),
    publication_date = coalesce(cast(in_json->>'publication_date' as timestamp), publication_date)
    where id = cast(in_json->>'id' as integer);

    call update_date(in_json);

    return 'Update succsessful.';
END;
$$ LANGUAGE plpgsql;

select update_album('{
    "id": 2,
    "title": "Gimnastica liricala"
}'::json);

CREATE OR REPLACE procedure update_date(in_json JSON) AS $$
BEGIN
    update posts
    set
    updated_at = now()
    where id = cast(in_json->>'id' as integer);

    update contributions
    set
    updated_at = now()
    where id = cast(in_json->>'id' as integer);
END;
$$ LANGUAGE plpgsql;

-- user:
-- -first_name
-- -last_name

-- -email
-- -nickname

-- -password_hash
-- -password_salt

CREATE OR REPLACE FUNCTION update_user(in_json JSON)
RETURNS varchar AS $$
DECLARE
    err_alphanum text := 'must only contain letters and numbers.';
    err_invalid text := 'is invalid.';
    reg_at text := '^.+@.+$';
BEGIN
    if in_json->>'first_name' != null and not is_alphanumeric(in_json->>'first_name') then
        return 'First name ' || err_alphanum;
    end if;

    if in_json->>'last_name' != null and not is_alphanumeric(in_json->>'first_name') then
        return 'Last name ' || err_alphanum;
    end if;

    if in_json->>'nickname' != null and not is_alphanumeric(in_json->>'nickname') then
        return 'Nickname ' || err_alphanum;
    end if;

    if in_json->>'email' != null and not is_matching(in_json->>'email', reg_at) then
        return 'Email ' || err_invalid;
    end if;

    update users
    set
    first_name = coalesce(in_json->>'first_name', first_name),
    last_name = coalesce(in_json->>'last_name', last_name),
    nickname = coalesce(in_json->>'nickname', nickname),
    email = coalesce(in_json->>'email', email),
    password_hash = coalesce(in_json->>'password_hash', password_hash),
    password_salt = coalesce(in_json->>'password_salt', password_salt),
    updated_at = now()
    where id = cast(in_json->>'id' as integer);

    return 'Update succsessful.';
END;
$$ LANGUAGE plpgsql;

-- select update_user('{
--     "id": 12,
--     "last_name": "Bob"
-- }'::json);

-- poems:
-- -title

CREATE OR REPLACE FUNCTION update_poem(in_json JSON)
RETURNS varchar AS $$
DECLARE
    err_alphanum text := 'must only contain letters and numbers.';
BEGIN
    if in_json->>'title' != null and not is_alphanumeric(in_json->>'title') then
        return 'Title ' || err_alphanum;
    end if;

    update poems
    set
    title = coalesce(in_json->>'title', title)
    where id = cast(in_json->>'id' as integer);

    call update_date(in_json);

    return 'Update succsessful.';
END;
$$ LANGUAGE plpgsql;


-- reactions:
-- -type (stergem si cream o reactie noua daca se schimba de la like la dislike)
-- --de modificat la insert sa verificam daca exista deja reactia la user

CREATE OR REPLACE FUNCTION update_reactions(in_json JSON)
RETURNS varchar AS $$
BEGIN
    select insert_reaction(in_json);
END;
$$ LANGUAGE plpgsql;

-- annotations:
-- -content
-- on lyric update
--     -offset
--     -length

CREATE OR REPLACE FUNCTION update_annotations(in_json JSON)
RETURNS varchar AS $$
DECLARE
    err_alphanum text := 'must only contain letters and numbers.';
BEGIN
    update annotations
    set
    content = coalesce(in_json->>'content', content)
    where id = cast(in_json->>'id' as integer);

    call update_date(in_json);

    return 'Update succsessful.';
END;
$$ LANGUAGE plpgsql;

-- lyrics:
-- -content => update offset & length
-- -title

CREATE OR REPLACE FUNCTION update_lyrics(in_json JSON)
RETURNS varchar AS $$
DECLARE
    annotation_ids INTEGER[];
    annotation_id integer;
    st integer;
    dr integer;
    lg integer;
    new_len integer;
    i integer;
    ok boolean;
    old_content varchar;
    new_content varchar;
BEGIN
    --iterate through the annotations of the lyric
    --and compare the previous content to the new content in the interval [offset, offset + length - 1]
    --if there is a difference, then delete the annotation

    if in_json->>'title' is not null and not is_alphanumeric(in_json->>'title') then
        return 'Title ' || err_alphanum;
    end if;

    select content
    into old_content
    from lyrics
    where id = cast(in_json->>'id' as integer);

    new_content := in_json->>'content';
    update lyrics
    set
    title = coalesce(in_json->>'title', title),
    content = coalesce(new_content, content)
    where id = cast(in_json->>'id' as integer);

    SELECT array_agg(id) INTO annotation_ids
    FROM annotations
    WHERE lyrics_id = cast(in_json->>'id' as integer);

    select length(in_json->>'content') into new_len;

    call update_date(in_json);

    if array_length(annotation_ids, 1) is null then
        return 'Update successful.';
    end if;

    FOREACH annotation_id IN ARRAY annotation_ids
    LOOP
        select "offset", "length"
        into st, lg
        from annotations
        where id = annotation_id;
        dr := st + lg - 1;

        if dr > new_len then
            delete
            from annotations
            where lyrics_id = cast(in_json->>'id' as integer);
            continue;
        end if;

        ok := 1;
        for i in st..dr LOOP
            if old_content[i] <> new_content[i] then
                ok := 0;
                exit;
            end if;
        END LOOP;

        if ok = 0 then
            delete
            from annotations
            where lyrics_id = cast(in_json->>'id' as integer);
            continue;
        end if;
    END LOOP;

    return 'Update succsessful.';
END;
$$ LANGUAGE plpgsql;

-- select update_lyrics('{
--     "id": 25,
--     "content": "Vreme trece.."
-- }'::json);


create or replace procedure test() as $$
declare
    annotation_ids INTEGER[];
    annotation_id integer;
begin
    SELECT array_agg(id) INTO annotation_ids
    FROM annotations
    WHERE lyrics_id = 26;

    raise notice '%', array_length(annotation_ids, 1);
end;
$$ LANGUAGE plpgsql;

call test();