-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date timestamp with time zone NOT NULL DEFAULT now(),
  sender uuid NOT NULL DEFAULT gen_random_uuid(),
  receiver uuid NOT NULL DEFAULT gen_random_uuid(),
  amount real NOT NULL,
  currency text NOT NULL,
  type text NOT NULL,
  CONSTRAINT transactions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wallet (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  BTC real NOT NULL,
  USD real,
  EUR real,
  CONSTRAINT wallet_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_id_fkey FOREIGN KEY (id) REFERENCES public.users(id)
);