create or replace function is_matching(string varchar, pattern varchar)
    returns boolean as
$$
begin
    if string ~ pattern then
        return true;
    else
        return false;
    end if;
end;
$$ language plpgsql;

create or replace function is_alphanumeric(string varchar)
    returns boolean as
$$
begin
    return is_matching(string, '^[A-Za-z0-9 ]+$');
end;
$$ language plpgsql;
