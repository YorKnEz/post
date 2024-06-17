CREATE OR REPLACE FUNCTION is_matching(string varchar, pattern varchar)
RETURNS boolean AS $$
BEGIN
    IF string ~ pattern THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

create or replace function is_alphanumeric(string varchar)
returns boolean as $$
begin
    return is_matching(string, '^[A-Za-z0-9 ]+$');
end;
$$ language plpgsql;
