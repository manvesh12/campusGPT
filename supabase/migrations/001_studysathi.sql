create extension if not exists vector;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  college_name text,
  branch text,
  semester text,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, college_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'college_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  storage_path text not null,
  file_size integer not null,
  page_count integer,
  processing_status text not null default 'uploaded' check (processing_status in ('uploaded','processing','ready','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  page_number integer not null,
  chunk_index integer not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  source_pages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.study_generations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('summary','important_questions','mcqs','flashcards')),
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique(document_id, type)
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  input_tokens integer default 0,
  output_tokens integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists document_chunks_embedding_idx on public.document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create or replace function public.match_document_chunks(query_embedding vector(1536), match_document_id uuid, match_count int default 6)
returns table (content text, page_number integer, similarity float)
language sql stable as $$
  select content, page_number, 1 - (embedding <=> query_embedding) as similarity
  from public.document_chunks
  where document_id = match_document_id
  order by embedding <=> query_embedding
  limit match_count;
$$;

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.study_generations enable row level security;
alter table public.usage_events enable row level security;

create policy "profile own data" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "document own data" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "chunk own data" on public.document_chunks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "conversation own data" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "generation own data" on public.study_generations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "usage own data" on public.usage_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "message own conversation" on public.messages for all using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())) with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do nothing;
create policy "upload own files" on storage.objects for insert to authenticated with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read own files" on storage.objects for select to authenticated using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own files" on storage.objects for delete to authenticated using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
