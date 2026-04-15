import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const targets = [
  { email: "orga@example.com",  password: "CHANGE_ME_BEFORE_PROD" },
  { email: "scan1@example.com", password: "CHANGE_ME_BEFORE_PROD" },
  { email: "scan2@example.com", password: "CHANGE_ME_BEFORE_PROD" },
];

const { data: list, error: listErr } = await sb.auth.admin.listUsers();
if (listErr) { console.error(listErr); process.exit(1); }

for (const t of targets) {
  const user = list.users.find(u => u.email === t.email);
  if (!user) { console.log("✗ missing:", t.email); continue; }
  const { error } = await sb.auth.admin.updateUserById(user.id, {
    password: t.password,
    email_confirm: true,
  });
  if (error) console.log("✗", t.email, error.message);
  else console.log("✓ reset:", t.email);
}
