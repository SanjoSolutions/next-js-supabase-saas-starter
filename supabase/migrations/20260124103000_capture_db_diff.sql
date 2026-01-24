drop policy "Members can view organization memberships" on "public"."memberships";

drop policy "Allow guests to view organizations" on "public"."organizations";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE organization_id = org_id
    AND user_id = auth.uid()
  );
$function$
;

create or replace view "public"."organization_members" as  SELECT m.id,
    m.created_at,
    m.user_id,
    m.organization_id,
    m.role,
    u.email
   FROM (public.memberships m
     LEFT JOIN auth.users u ON ((m.user_id = u.id)));



  create policy "Users can accept invites meant for them"
  on "public"."invites"
  as permissive
  for update
  to authenticated
using ((email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text))
with check ((status = 'accepted'::text));



  create policy "Members can view org memberships via function"
  on "public"."memberships"
  as permissive
  for select
  to authenticated
using (public.is_org_member(organization_id));



  create policy "Users can create membership for themselves"
  on "public"."memberships"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "Allow guests to view organizations"
  on "public"."organizations"
  as permissive
  for select
  to public
using (true);



