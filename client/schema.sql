-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.transaction (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date timestamp with time zone NOT NULL DEFAULT now(),
  sender uuid NOT NULL DEFAULT gen_random_uuid(),
  receiver uuid NOT NULL DEFAULT gen_random_uuid(),
  amount real NOT NULL,
  currency text NOT NULL,
  type text NOT NULL,
  CONSTRAINT transaction_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  frozen boolean NOT NULL DEFAULT false,
  CONSTRAINT user_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wallet (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  BTC real NOT NULL DEFAULT '0'::real,
  USD real NOT NULL DEFAULT '0'::real,
  EUR real NOT NULL DEFAULT '0'::real,
  CONSTRAINT wallet_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_id_fkey FOREIGN KEY (id) REFERENCES public.user(id)
);