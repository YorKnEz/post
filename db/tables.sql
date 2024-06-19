drop view albums_view;

drop table tokens;
drop table annotations cascade;
drop table lyrics;
drop table album_poems;
drop table poems;
drop table albums;
drop table reactions;
drop table requests;
drop table contributions;
drop table posts;
drop table users;

create table users
(
    id                        serial primary key,
    created_at                timestamp default now(),
    updated_at                timestamp default now(),
    -- primary information
    first_name                varchar(32),                 -- between 2 and 32 characters
    last_name                 varchar(32),                 -- between 2 and 32 characters
    nickname                  varchar(32) unique not null, -- between 4 and 32 characters
    email                     varchar(256) unique,         -- valid email
    new_email                 varchar(256),                -- valid email
    -- auth information
    verified                  boolean   default false,     -- whether or not the account is verified
    password_hash             varchar(256),
    password_salt             varchar(256),
    -- other information
    roles                     integer   default 0,         -- a bitfield: 0b1 - poet, 0b10 - admin
    albums_count              integer   default 0,
    albums_contributions      integer   default 0,
    poems_count               integer   default 0,
    poems_contributions       integer   default 0,
    created_lyrics_count      integer   default 0,
    translated_lyrics_count   integer   default 0,
    lyrics_contributions      integer   default 0,
    annotations_count         integer   default 0,
    annotations_contributions integer   default 0
);

create table posts
(
    id         serial primary key,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    -- primary information
    poster_id  integer   not null,
    type       varchar(16),                      -- one of: album, poem, lyrics, annotation
    verified   boolean            default false, -- verified by admin, unverified posts are not displayed on the site to regular users
    views      integer            default 0,     -- number of views of the post, incremented by 1 each time it is retrieved from db

    constraint posts_f1 foreign key (poster_id) references users (id)
);

create table contributions
(
    id             serial primary key,
    created_at     timestamp not null default now(),
    updated_at     timestamp not null default now(),
    -- primary information
    contributor_id integer   not null,
    post_id        integer   not null,

    constraint contributions_f1 foreign key (contributor_id) references users (id),
    constraint contributions_f2 foreign key (post_id) references posts (id)
);

create table requests
(
    id           serial primary key,
    created_at   timestamp not null default now(),
    updated_at   timestamp not null default now(),
    -- primary information
    requester_id integer   not null,
    post_id      integer,

    constraint requests_u1 unique (requester_id, post_id),
    constraint requests_f1 foreign key (requester_id) references users (id),
    constraint post_f2 foreign key (post_id) references posts (id)
);

create table reactions
(
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    -- primary information
    post_id    integer,
    user_id    integer,
    type       integer, -- 0 - like, 1 - dislike

    constraint reactions_u1 primary key (post_id, user_id),
    constraint reactions_f1 foreign key (post_id) references posts (id),
    constraint reactions_f2 foreign key (user_id) references users (id)
);

create table albums
(
    id               integer primary key,
    -- primary information
    author_id        integer      not null,
    title            varchar(256) not null, -- between 4 and 256 characters
    -- optional
    publication_date timestamp,

    constraint albums_u1 unique (author_id, title),
    constraint albums_f1 foreign key (id) references posts (id),
    constraint albums_f2 foreign key (author_id) references users (id)
);

create table poems
(
    id               integer primary key,
    -- primary information
    author_id        integer      not null,
    title            varchar(256) not null, -- between 4 and 256 characters
    -- optional
    publication_date timestamp,

    constraint poems_f1 foreign key (id) references posts (id),
    constraint poems_f2 foreign key (author_id) references users (id)
);

create table album_poems
(
    album_id integer,
    poem_id  integer,

    constraint album_poems_pk primary key (album_id, poem_id),
    constraint album_poems_f1 foreign key (album_id) references albums (id),
    constraint album_poems_f2 foreign key (poem_id) references poems (id)
);

create table annotations
(
    id        integer primary key,
    -- primary information
    lyrics_id integer not null,
    content   varchar not null, -- between 16 and 4000 characters
    "offset"  integer not null, -- 0 <= offset, 0 < length, offset + length <= lyrics_content.length
    length    integer not null, -- [offset, offset + length)

    constraint annotations_f1 foreign key (id) references posts (id)
);

create table lyrics
(
    id                 integer primary key,
    -- primary information
    poem_id            integer      not null,
    title              varchar(256) not null, -- between 4 and 256 characters
    main_annotation_id integer,
    content            varchar      not null, -- between 16 and 4000 characters
    language           varchar(2)   not null, -- exactly 2 characters representing a valid language (!)

    constraint lyrics_u1 unique (poem_id, language),
    constraint lyrics_f1 foreign key (id) references posts (id),
    constraint lyrics_f2 foreign key (poem_id) references poems (id),
    constraint lyrics_f3 foreign key (main_annotation_id) references annotations (id)
);

-- add constraint after because lyrics and annotations reference each other
alter table annotations
    add constraint annotations_f2 foreign key (lyrics_id) references lyrics (id);

create table tokens
(
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    value      text primary key,
    user_id    integer   not null,
    type       text      not null, -- session, emailConfirm, emailChange, nicknameChange, passwordChange

    constraint tokens_f1 foreign key (user_id) references users (id)
);

-- views

create or replace view albums_view as
select p.id,
       p.created_at,
       p.updated_at,
       find_user_card_by_id(p.poster_id)                                                 poster,
       find_user_card_by_id(a.author_id)                                                 author,
       p.verified,
       a.title,
       a.publication_date,
       p.views,
       (select count(*) from contributions where post_id = a.id)                         contributions,
       (select count(distinct contributor_id) from contributions where post_id = a.id)   contributors,
       (select count(*) from reactions where post_id = a.id)                             reactions,
       (select count(*) from reactions where post_id = a.id and type = 0)                likes,
       (select count(*) from reactions where post_id = a.id and type = 1)                dislikes,
       (select count(*) from album_poems where album_id = a.id)                          poems_count,
       (p.views::numeric / (select max(views)::numeric from posts where type = 'album')) views_ratio,
       ((select count(*)::numeric from contributions where post_id = a.id)  / (select max(x) from (select count(post_id)::numeric x from contributions group by post_id))) views_ratio,

from albums a
         join posts p on p.id = a.id;

select count(post_id)::numeric x from contributions group by post_id;

select *
from albums_view;