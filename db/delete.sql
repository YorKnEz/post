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
