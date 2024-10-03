drop view annotations_view;
drop view poems_view;
drop view albums_view;

create or replace view albums_view as
select p.id,
       p.created_at,
       p.updated_at,
       find_user_card_by_id(p.poster_id)                                                  poster,
       find_user_card_by_id(a.author_id)                                                  author,
       p.verified,
       a.cover,
       a.title,
       a.publication_date,
       (select count(*) from contributions where post_id = a.id)                          contributions,
       (select count(*)::numeric from contributions where post_id = a.id) /
       (select max(contributions)::numeric
        from (select count(post_id) contributions from contributions group by post_id) t) contributions_ratio,
       (select count(distinct contributor_id) from contributions where post_id = a.id)    contributors,
       (select count(distinct contributor_id)::numeric from contributions where post_id = a.id) /
       (select max(contributors)::numeric
        from (select count(distinct contributor_id) contributors
              from contributions
              group by post_id) t)                                                        contributors_ratio,
       (select count(*)::numeric from reactions where post_id = a.id)                     reactions,
       (select count(*)::numeric from reactions where post_id = a.id and type = 0)        likes,
       (select count(*)::numeric from reactions where post_id = a.id and type = 1)        dislikes,
       (select count(*)::numeric from album_poems where album_id = a.id)                  poems_count
from albums a
         join posts p on p.id = a.id;

create or replace view poems_view as
select p.id,
       p.created_at,
       p.updated_at,
       p.verified,
       find_user_card_by_id(po.author_id)                                                 author,
       find_user_card_by_id(p.poster_id)                                                  poster,
       find_poem_card_by_id(po.poem_id)                                                   poem,
       po.language,
       po.cover,
       po.title,
       po.publication_date,
       find_annotation_by_id(po.main_annotation_id)                                       main_annotation,
       po.content,
       find_annotations_metadata_by_poem_id(p.id, po.main_annotation_id)                  annotations,
       (select count(*) from contributions where post_id = po.id)                         contributions,
       (select count(*)::numeric from contributions where post_id = po.id) /
       (select max(contributions)::numeric
        from (select count(post_id) contributions from contributions group by post_id) t) contributions_ratio,
       (select count(distinct contributor_id) from contributions where post_id = po.id)   contributors,
       (select count(distinct contributor_id)::numeric from contributions where post_id = po.id) /
       (select max(contributors)::numeric
        from (select count(distinct contributor_id) contributors
              from contributions
              group by post_id) t)                                                        contributors_ratio,
       (select count(*)::numeric from reactions where post_id = po.id)                    reactions,
       (select count(*)::numeric from reactions where post_id = po.id and type = 0)       likes,
       (select count(*)::numeric from reactions where post_id = po.id and type = 1)       dislikes
from poems po
         join posts p on p.id = po.id;

create or replace view annotations_view as
select p.id,
       p.created_at,
       p.updated_at,
       find_user_card_by_id(p.poster_id)                                                  poster,
       p.verified,
       a.poem_id,
       a.content,
       a.offset,
       a.length,
       (select count(*) from contributions where post_id = a.id)                          contributions,
       (select count(*)::numeric from contributions where post_id = a.id) /
       (select max(contributions)::numeric
        from (select count(post_id) contributions from contributions group by post_id) t) contributions_ratio,
       (select count(distinct contributor_id) from contributions where post_id = a.id)    contributors,
       (select count(distinct contributor_id)::numeric from contributions where post_id = a.id) /
       (select max(contributors)::numeric
        from (select count(distinct contributor_id) contributors
              from contributions
              group by post_id) t)                                                        contributors_ratio,
       (select count(*)::numeric from reactions where post_id = a.id)                     reactions,
       (select count(*)::numeric from reactions where post_id = a.id and type = 0)        likes,
       (select count(*)::numeric from reactions where post_id = a.id and type = 1)        dislikes
from annotations a
         join posts p on p.id = a.id;