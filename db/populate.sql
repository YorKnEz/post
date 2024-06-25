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
        user_count       int := 30; -- configure number of users
        post_count       int; -- configure number of posts
        reaction_count   int := 1000; -- configure number of reactions
        album_count      int := 10; -- configure number of albums
        poem_count       int := 100; -- configure number of poems
        album_poem_count int := 10; -- configure number of album_poems

        i                int;
        l_user_id        int;
        l_post_id        int;
        l_poem_id        int;
        l_album_id       int;
    begin
        -- populate users table
        for i in 0..user_count - 1
        loop
            insert into users (created_at, updated_at, first_name, last_name, nickname, avatar, email, verified,
                               password_hash, password_salt, roles)
            values (now(), now(), 'firstname' || i, 'lastname' || i, 'nickname' || i,
                    'https://79.118.82.16:4001/api/images/default-avatar', 'user' || i || '@example.com',
                    i % 2 = 1, 'hash' || i, 'salt' || i, (i % 3));
        end loop;

        -- populate albums table
        for i in 0..album_count - 1
        loop
            l_user_id := (i % user_count) + 1;
            perform add_album(l_user_id, format(
                    '{"authorId": "%s", "cover": "%s", "title": "%s", "publicationDate": "%s"}',
                    l_user_id,
                    'https://79.118.82.16:4001/api/images/default-album-cover',
                    'album title ' || i,
                    now()::text)::jsonb);
        end loop;

        -- populate poems table
        for i in 0..poem_count - 1
        loop
            l_user_id := (i % user_count) + 1;
            perform add_poem(l_user_id, format(
                    '{"authorId": "%s", "language": "%s", "cover": "%s", "title": "%s", "publicationDate": "%s", "about": "%s", "content": "%s"}',
                    l_user_id,
                    case when i % 3 = 0 then 'en' when i % 3 = 1 then 'es' when i % 3 = 2 then 'ro' end,
                    'https://79.118.82.16:4001/api/images/default-poem-cover',
                    'poem title ' || i,
                    now()::text,
                    'main annotation content ' || i,
                    'lyrical content ' || i)::jsonb);
        end loop;

        -- populate album_poems table
        for i in 0..album_poem_count - 1
        loop
            select id into l_album_id from albums where id % album_count = i % album_count limit 1;
            select id into l_poem_id from poems where id % poem_count = i % poem_count limit 1;

            if l_album_id is null or l_poem_id is null then
                continue;
            end if;

            insert into album_poems (album_id, poem_id)
            values (l_album_id, l_poem_id);
        end loop;

        select count(*) into post_count from posts;

        -- populate reactions table
        for i in 0..reaction_count - 1
        loop
            l_user_id := (i % user_count) + 1;
            l_post_id := (i % post_count) + 1;
            begin
                call add_reaction(l_post_id, l_user_id, i % 2);
            exception
                when others then
            end;
        end loop;
    end
$$;
