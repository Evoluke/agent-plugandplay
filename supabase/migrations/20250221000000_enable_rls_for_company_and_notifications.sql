-- Enable row level security for company and notifications tables
alter table public.company enable row level security;
alter table public.notifications enable row level security;

-- Allow authenticated users to manage their own company record
create policy "Users can view own company" on public.company
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own company" on public.company
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own company" on public.company
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own company" on public.company
  for delete
  using (auth.uid() = user_id);

-- Allow authenticated users to read and update notifications that belong to their company
create policy "Company members can read notifications" on public.notifications
  for select
  using (
    exists (
      select 1
      from public.company c
      where c.id = notifications.company_id
        and c.user_id = auth.uid()
    )
  );

create policy "Company members can update notifications" on public.notifications
  for update
  using (
    exists (
      select 1
      from public.company c
      where c.id = notifications.company_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.company c
      where c.id = notifications.company_id
        and c.user_id = auth.uid()
    )
  );
