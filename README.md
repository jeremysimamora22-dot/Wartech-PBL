# WarTech — Fase 1

1. Buat project di supabase.com, lalu buka SQL Editor dan jalankan seluruh isi `supabase/schema.sql`.
2. Salin `.env.example` menjadi `.env`, isi URL dan anon key.
3. `npm install` lalu `npm run dev`.
4. Daftar akun lewat `/register`, lalu jadikan admin (SQL Editor):
   `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'EMAILMU');`
5. Untuk uji cepat, matikan "Confirm email" di Supabase → Authentication → Providers → Email.
