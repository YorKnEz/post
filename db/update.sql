create or replace procedure __update_post(p_id integer, p_user_id integer) as
$$
begin
    update posts set updated_at = now() where id = p_id;

    insert into contributions(contributor_id, post_id) values (p_user_id, p_id);
end;
$$ language plpgsql;

create or replace function update_request(p_id integer, p_approve boolean) returns jsonb as
$$
declare
    l_post_id integer;
    l_requester_id integer;
    result    jsonb;
begin
    select r.id, jsonb_build_object('email', u.email, 'name', u.first_name || ' ' || u.last_name), r.post_id, r.requester_id
    into p_id, result, l_post_id, l_requester_id
    from requests r
             join users u on r.requester_id = u.id
    where r.id = p_id;

    if p_id is null then
        raise exception 'request not found';
    end if;

    if l_post_id is not null then
        result = result || (select jsonb_build_object('type', type) from posts where id = l_post_id);

        if (result ->> 'type') = 'album' then
            result = result ||
                     (select jsonb_build_object(
                                     'extra_data', jsonb_build_object(
                                     'id', l_post_id,
                                     'title', title))
                      from albums
                      where id = l_post_id);
        elsif (result ->> 'type') = 'poem' then
            result = result ||
                     (select jsonb_build_object(
                                     'extra_data', jsonb_build_object(
                                     'id', l_post_id,
                                     'title', title))
                      from poems
                      where id = l_post_id);
        elsif (result ->> 'type') = 'annotation' then
            result = result ||
                     (select jsonb_build_object(
                                     'extra_data', jsonb_build_object(
                                     'id', l_post_id,
                                     'poem_id', poem_id
                                                   ))
                      from annotations
                      where id = l_post_id);
        end if;

        if p_approve = true then
            update posts set verified = true, updated_at = now() where id = l_post_id;
        else
            begin
                call delete_album(l_post_id);
            exception
                when others then
            end;

            begin
                call delete_poem(l_post_id);
            exception
                when others then
            end;

            begin
                call delete_annotation(l_post_id);
            exception
                when others then
            end;
        end if;
    else
        result = result || '{
          "type": "user"
        }'::jsonb;
        result['extra_data'] = '{}'::jsonb;

        if p_approve = true then
            update users set roles = roles | 1, updated_at = now() where id = l_requester_id;
        end if;
    end if;

    delete from requests where id = p_id;
    return result;
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

    -- increment albums_contributions of user
    update users
    set albums_contributions = albums_contributions + 1
    where id = p_user_id;

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

    -- increment poems_contributions of user
    update users
    set poems_contributions = poems_contributions + 1
    where id = p_user_id;

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

    -- increment annotations_contributions of user
    update users
    set annotations_contributions = annotations_contributions + 1
    where id = p_user_id;

    return find_annotation_by_id(p_id);
end;
$$ language plpgsql;