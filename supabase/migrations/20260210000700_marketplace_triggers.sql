-- Marketplace triggers for activity logging and notifications

-- Log listing created
create or replace function public.log_listing_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  actor_email_val text;
begin
  select email into actor_email_val from auth.users where id = auth.uid();

  insert into activity_logs (organization_id, actor_id, actor_email, activity_type, title, description, metadata)
  values (
    new.organization_id,
    auth.uid(),
    actor_email_val,
    'listing_created',
    'Listing created',
    'New ' || new.listing_type || ' listing: ' || new.title,
    jsonb_build_object(
      'listing_id', new.id,
      'listing_type', new.listing_type,
      'price_cents', new.price_cents
    )
  );

  return new;
end;
$$;

create trigger on_listing_created_log
  after insert on service_listings
  for each row execute procedure public.log_listing_created();

-- Notify both orgs when a match is proposed
create or replace function public.notify_match_proposed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  request_org_id uuid;
  offer_org_id uuid;
  request_user_ids uuid[];
  offer_user_ids uuid[];
  uid uuid;
begin
  -- Get org IDs from listings
  select organization_id into request_org_id
  from service_listings where id = new.request_listing_id;

  select organization_id into offer_org_id
  from service_listings where id = new.offer_listing_id;

  -- Get all members of both orgs
  select array_agg(user_id) into request_user_ids
  from memberships where organization_id = request_org_id;

  select array_agg(user_id) into offer_user_ids
  from memberships where organization_id = offer_org_id;

  -- Notify request org members
  if request_user_ids is not null then
    foreach uid in array request_user_ids loop
      insert into notifications (user_id, organization_id, type, title, content, link)
      values (
        uid,
        request_org_id,
        'match_proposed',
        'New delivery match found',
        'A matching delivery offer has been found for your request.',
        '/marketplace/matches/' || new.id
      );
    end loop;
  end if;

  -- Notify offer org members
  if offer_user_ids is not null then
    foreach uid in array offer_user_ids loop
      insert into notifications (user_id, organization_id, type, title, content, link)
      values (
        uid,
        offer_org_id,
        'match_proposed',
        'New delivery match found',
        'A matching delivery request has been found for your offer.',
        '/marketplace/matches/' || new.id
      );
    end loop;
  end if;

  return new;
end;
$$;

create trigger on_match_proposed_notify
  after insert on order_matches
  for each row execute procedure public.notify_match_proposed();

-- Notify on contract status change
create or replace function public.notify_contract_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  buyer_user_ids uuid[];
  seller_user_ids uuid[];
  uid uuid;
  status_msg text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  status_msg := case new.status
    when 'paid' then 'Payment received for delivery contract'
    when 'in_progress' then 'Delivery is now in progress'
    when 'pickup_confirmed' then 'Package pickup confirmed'
    when 'delivered' then 'Package has been delivered'
    when 'completed' then 'Delivery contract completed'
    when 'disputed' then 'A dispute has been filed'
    when 'cancelled' then 'Delivery contract cancelled'
    else 'Contract status updated to ' || new.status
  end;

  select array_agg(user_id) into buyer_user_ids
  from memberships where organization_id = new.buyer_org_id;

  select array_agg(user_id) into seller_user_ids
  from memberships where organization_id = new.seller_org_id;

  -- Notify buyer org
  if buyer_user_ids is not null then
    foreach uid in array buyer_user_ids loop
      insert into notifications (user_id, organization_id, type, title, content, link)
      values (
        uid,
        new.buyer_org_id,
        'contract_status',
        status_msg,
        'Contract ' || coalesce(new.tracking_code, new.id::text) || ': ' || status_msg,
        '/marketplace/contracts/' || new.id
      );
    end loop;
  end if;

  -- Notify seller org
  if seller_user_ids is not null then
    foreach uid in array seller_user_ids loop
      insert into notifications (user_id, organization_id, type, title, content, link)
      values (
        uid,
        new.seller_org_id,
        'contract_status',
        status_msg,
        'Contract ' || coalesce(new.tracking_code, new.id::text) || ': ' || status_msg,
        '/marketplace/contracts/' || new.id
      );
    end loop;
  end if;

  return new;
end;
$$;

create trigger on_contract_status_change_notify
  after update on contracts
  for each row execute procedure public.notify_contract_status_change();

-- Notify counterparty when dispute is filed
create or replace function public.notify_dispute_filed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_contract contracts;
  counterparty_org_id uuid;
  counterparty_user_ids uuid[];
  uid uuid;
begin
  select * into v_contract from contracts where id = new.contract_id;

  -- Determine counterparty
  if new.initiator_org_id = v_contract.buyer_org_id then
    counterparty_org_id := v_contract.seller_org_id;
  else
    counterparty_org_id := v_contract.buyer_org_id;
  end if;

  select array_agg(user_id) into counterparty_user_ids
  from memberships where organization_id = counterparty_org_id;

  if counterparty_user_ids is not null then
    foreach uid in array counterparty_user_ids loop
      insert into notifications (user_id, organization_id, type, title, content, link)
      values (
        uid,
        counterparty_org_id,
        'dispute_filed',
        'Dispute filed on contract',
        'A dispute has been filed on contract ' || coalesce(v_contract.tracking_code, v_contract.id::text),
        '/marketplace/contracts/' || v_contract.id
      );
    end loop;
  end if;

  return new;
end;
$$;

create trigger on_dispute_filed_notify
  after insert on disputes
  for each row execute procedure public.notify_dispute_filed();
