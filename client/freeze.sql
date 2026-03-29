CREATE FUNCTION public.freeze_inactive_users()
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."user" AS u
  SET frozen = true
  WHERE u.frozen = false
    AND NOT EXISTS (
      SELECT 1
      FROM public.transaction AS t
      WHERE (t.sender = u.id OR t.receiver = u.id)
        AND t.date >= (now() - interval '90 days')
    );
END;
$$;
