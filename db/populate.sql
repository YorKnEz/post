create or replace procedure add_post(user_id integer, post_type text, verified integer, out post_id integer)
    language plpgsql as
$$
begin
    -- add post
    insert into posts (created_at, updated_at, poster_id, type, verified)
    values (now(), now(), user_id, post_type, verified)
    returning id into post_id;

    -- add request
    if verified = 0 then
        insert into requests (created_at, updated_at, requester_id, post_id)
        values (now(), now(), user_id, post_id);
    end if;

    -- add contribution
    insert into contributions (created_at, updated_at, contributor_id, post_id)
    values (now(), now(), user_id, post_id);
end;
$$;

do
$$
    declare
        user_count       int := 10; -- configure number of users
        post_count       int := 20; -- configure number of posts
        reaction_count   int := 20; -- configure number of reactions
        album_count      int := 5; -- configure number of albums
        poem_count       int := 7; -- configure number of poems
        album_poem_count int := 10; -- configure number of album_poems
        annotation_count int := 10; -- configure number of annotations
        lyrics_count     int := 10; -- configure number of lyrics

        i                int;
        user_id          int;
        post_id          int;
        poem_id          int;
        album_id         int;
        annotation_id    int;
        lyrics_id        int;
    begin
        -- populate users table
        for i in 0..user_count - 1
        loop
            insert into users (created_at, updated_at, first_name, last_name, nickname, email, verified,
                               password_hash, password_salt, roles, albums_count,
                               albums_contributions,
                               poems_count,
                               poems_contributions,
                               created_lyrics_count,
                               translated_lyrics_count,
                               lyrics_contributions,
                               annotations_count,
                               annotations_contributions)
            values (now(), now(), 'firstname' || i, 'lastname' || i, 'nickname' || i, 'user' || i || '@example.com',
                    (i % 2), 'hash' || i, 'salt' || i, (i % 3), (i * 2), (i * 3), (i * 1), (i % 3), (i * 2),
                    (i * 3), (i * 1), (i % 3), (i * 2));
        end loop;

        -- populate albums table
        for i in 0..album_count - 1
        loop
            user_id := (i % user_count) + 1;
            call add_post(user_id, 'album', i % 2, post_id);

            -- add album
            insert into albums (id, author_id, title, publication_date)
            values (post_id, user_id, 'album title ' || i, now());
        end loop;

        -- populate poems table
        for i in 1..poem_count
        loop
            user_id := (i % user_count) + 1;
            call add_post(user_id, 'poem', i % 2, post_id);

            -- add poem
            insert into poems (id, author_id, title, publication_date)
            values (post_id, user_id, 'poem title ' || i, now())
            returning id into poem_id;
        end loop;

        -- populate album_poems table
        for i in 0..album_poem_count - 1
        loop
            select id into album_id from albums where id % album_count = i % album_count limit 1;
            select id into poem_id from poems where id % poem_count = i % poem_count limit 1;
            insert into album_poems (album_id, poem_id)
            values (album_id, poem_id);
        end loop;

        -- populate lyrics table
        for i in 0..lyrics_count - 1
        loop
            user_id := (i % user_count) + 1;
            call add_post(user_id, 'lyrics', i % 2, lyrics_id);

            select id into poem_id from poems where id % poem_count = i % poem_count limit 1;
            select id
            into annotation_id
            from annotations
            where id % annotation_count = i % annotation_count
            limit 1;

            -- add lyrics
            insert into lyrics (id, poem_id, title, main_annotation_id, content, language)
            values (lyrics_id, poem_id, 'lyrics title ' || i, null, 'lyrics content ' || i,
                    case when i % 3 = 0 then 'en' when i % 3 = 1 then 'es' when i % 3 = 2 then 'ro' end);

            call add_post(user_id, 'annotation', i % 2, annotation_id);

            -- add annotation
            insert into annotations (id, lyrics_id, content, "offset", length)
            values (annotation_id, lyrics_id, 'main annotation content ' || i, (i % 100), (i % 50) + 10);

            update lyrics set main_annotation_id = annotation_id where id = lyrics_id;
        end loop;

        -- populate reactions table
        for i in 0..reaction_count - 1
        loop
            user_id := (i % user_count) + 1;
            post_id := (i % post_count) + 1;
            insert into reactions (created_at, updated_at, post_id, user_id, type)
            values (now(), now(), post_id, user_id, (i % 2));
        end loop;
    end
$$;
