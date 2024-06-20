create or replace procedure add_post(user_id integer, post_type text, verified boolean, out post_id integer)
    language plpgsql as
$$
begin
    -- add post
    insert into posts (created_at, updated_at, poster_id, type, verified)
    values (now(), now(), user_id, post_type, verified)
    returning id into post_id;

    -- add request
    if verified = false then
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
        post_count       int; -- configure number of posts
        reaction_count   int := 20; -- configure number of reactions
        album_count      int := 5; -- configure number of albums
        poem_count       int := 7; -- configure number of poems
        album_poem_count int := 10; -- configure number of album_poems
        annotation_count int := 10; -- configure number of annotations

        i                int;
        l_user_id        int;
        l_post_id        int;
        l_poem_id        int;
        l_album_id       int;
        l_annotation_id  int;
    begin
        -- populate users table
        for i in 0..user_count - 1
        loop
            insert into users (created_at, updated_at, first_name, last_name, nickname, email, verified,
                               password_hash, password_salt, roles)
            values (now(), now(), 'firstname' || i, 'lastname' || i, 'nickname' || i, 'user' || i || '@example.com',
                    i % 2 = 1, 'hash' || i, 'salt' || i, (i % 3));
        end loop;

        -- populate albums table
        for i in 0..album_count - 1
        loop
            l_user_id := (i % user_count) + 1;
            call add_post(l_user_id, 'album', i % 2 = 1, l_post_id);

            -- add album
            insert into albums (id, author_id, title, publication_date)
            values (l_post_id, l_user_id, 'album title ' || i, now());
        end loop;

        -- populate poems table
        for i in 0..poem_count - 1
        loop
            l_user_id := (i % user_count) + 1;
            call add_post(l_user_id, 'poem', i % 2 = 1, l_poem_id);

            -- add poem
            insert into poems (id, poem_id, author_id, title, main_annotation_id, content, language, publication_date)
            values (l_poem_id, null, l_user_id, 'poem title ' || i, null, 'lyrical content ' || i,
                    case when i % 3 = 0 then 'en' when i % 3 = 1 then 'es' when i % 3 = 2 then 'ro' end, now());

            call add_post(l_user_id, 'annotation', i % 2 = 1, l_annotation_id);

            -- add annotation
            insert into annotations (id, poem_id, content, "offset", length)
            values (l_annotation_id, l_poem_id, 'main annotation content ' || i, (i % 100), (i % 50) + 10);

            update poems set main_annotation_id = l_annotation_id where id = l_poem_id;
        end loop;

        -- populate album_poems table
        for i in 0..album_poem_count - 1
        loop
            select id into l_album_id from albums where id % album_count = i % album_count limit 1;
            select id into l_poem_id from poems where id % poem_count = i % poem_count limit 1;
            insert into album_poems (album_id, poem_id)
            values (l_album_id, l_poem_id);
        end loop;

        select count(*) into post_count from posts;

        -- populate reactions table
        for i in 0..reaction_count - 1
        loop
            l_user_id := (i % user_count) + 1;
            l_post_id := (i % post_count) + 1;
            insert into reactions (created_at, updated_at, post_id, user_id, type)
            values (now(), now(), l_post_id, l_user_id, (i % 2));
        end loop;
    end
$$;
