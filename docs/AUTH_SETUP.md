# Sign-up, OTP email (Brevo) & colleges — setup

## Student flow
1. **Sign up** (`/signup`): search & pick college (name + city/state) → enter email → 6-digit code is emailed.
2. **Verify** (`/verify`): enter code → account created & signed in.
3. **Details** (`/onboarding`): name, mobile, course, department, semester, graduation year, consents.
4. **Start** (`/start`): **Buy** (browse all items + search) or **Sell** (photos, name, price, age, used-for → "List my item").

## 1. Brevo SMTP (Supabase Dashboard → Authentication → Emails → SMTP Settings)
- Enable custom SMTP. Host `smtp-relay.brevo.com`, port `587`, username = your Brevo SMTP login, password = Brevo **SMTP key** (not the API key).
- Sender: a verified sender/domain in Brevo (e.g. `no-reply@yourdomain.com`), sender name `Stumate`.
- Authentication → Rate Limits: raise "emails sent per hour" (default is low) once SMTP is on.

## 2. Email templates (Authentication → Emails → Templates)
The app uses a **code**, not a link. In both **Magic Link** (existing users) and **Confirm signup** (new users) include the token:

```html
<h2>Your Stumate code</h2>
<p>Enter this code to continue: <strong>{{ .Token }}</strong></p>
<p>It expires in 1 hour. If you didn't ask for it, ignore this email.</p>
```

Also set Authentication → Providers → Email: "Confirm email" ON, OTP length 6.

## 3. Colleges
- ~140 colleges are seeded (name, city, state). Students can request a missing one in the sign-up screen; requests land in `college_requests` (service role only).
- **Email domain rule:** a college with **no** `allowed_email_domains` accepts any email and the profile is marked `college_verified = false`. A college **with** domains only accepts matching emails (`college_verified = true`).
- Add domains for a college:

```sql
update public.colleges
set allowed_email_domains = array['iitb.ac.in']
where name = 'IIT Bombay';
```

- Add a new college:

```sql
insert into public.colleges (name, city, state, country, allowed_email_domains)
values ('Your College', 'City', 'State', 'India', array['yourcollege.edu']);
```

## 4. Make yourself admin
```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
```
