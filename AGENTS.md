# 🧪 UNTESTABLE CASES — IMPORTANT VERIFICATION RULES

If any authentication test cannot be fully executed inside the current AI Studio environment, **DO NOT pretend that the test passed.**

Instead, classify the test clearly as one of:

- `PASS` — actually tested and confirmed working
- `FAIL` — actually tested and confirmed broken
- `BLOCKED` — could not be tested because of an external dependency/configuration
- `NOT TESTED` — test was not executed

---

# 1. NEVER CLAIM A TEST PASSED WITHOUT ACTUALLY TESTING IT

Do NOT say:

> "Everything is working."

unless the relevant flow was actually executed.

Do NOT invent:

- successful login
- successful signup
- successful OTP
- successful email delivery
- successful session persistence
- successful database operation
- successful production deployment

If you cannot verify it, explicitly say so.

---

# 2. SEPARATE CODE BUGS FROM EXTERNAL CONFIGURATION

If the code is correct but testing is blocked by an external service/configuration, do NOT rewrite working code unnecessarily.

For example:

```text
Website code
        ↓
Supabase
        ↓
External email/SMS provider
```

If the external provider cannot be tested from AI Studio, report:

```text
BLOCKED — external provider cannot be verified in this environment.
```

Then verify everything that CAN be tested locally.

---

# 3. TEST EVERYTHING THAT CAN BE TESTED

Even if one external test is blocked, continue testing the rest.

For authentication, test as much as possible:

### Frontend

- Signup form
- Login form
- Input validation
- Submit handlers
- Error handling
- Loading states
- Button functionality
- Auth state management
- Route protection
- Role routing
- Logout
- Refresh behavior where possible

### Backend

- Supabase client initialization
- Authentication calls
- Database queries
- Profile creation
- UUID mapping
- Role retrieval
- RLS behavior where testable
- Session handling code
- Error handling

Do not stop the entire audit because one test is unavailable.

---

# 4. REAL EMAIL / OTP

If real email or SMS/OTP delivery cannot be verified from AI Studio:

Do NOT create a fake OTP.

Do NOT hardcode an OTP.

Do NOT bypass verification.

Do NOT claim the message was delivered.

Report:

```text
BLOCKED — real message delivery requires external provider verification.
```

Still verify that the website correctly calls the intended authentication operation and handles success/error responses.

---

# 5. PRODUCTION-ONLY TESTS

If a test requires the deployed website, do not claim it was tested in the development preview.

For example:

```text
Development Preview → PASS
Production Deployment → NOT TESTED
```

or:

```text
Production test → BLOCKED
Reason: deployment/environment access unavailable
```

Do not confuse preview results with production results.

---

# 6. SESSION PERSISTENCE

If long-duration testing cannot be performed because AI Studio cannot realistically wait for the required period:

Do not claim:

> "The session works forever."

Instead:

### Verify technically:

- Supabase session configuration
- Auth state listener
- Token refresh handling
- Session restoration
- Logout handling
- Application startup/auth initialization

Then report:

```text
CODE VERIFICATION → PASS
LONG-DURATION REAL-WORLD TEST → NOT TESTED
```

Do not invent a result.

---

# 7. USER / OWNER / ADMIN TEST ACCOUNTS

Do not invent real credentials.

If test accounts are required but unavailable:

```text
USER → NOT TESTED / BLOCKED
OWNER → NOT TESTED / BLOCKED
ADMIN → NOT TESTED / BLOCKED
```

Explain exactly what is required to perform the test.

If safe test accounts already exist in the project, use those where appropriate.

Never expose passwords in the final report.

---

# 8. DATABASE TESTS

If the database can be queried safely, actually verify:

```text
Auth UID
=
Profile UID
```

Verify:

```text
role = user
role = owner
role = admin
```

If database access is unavailable:

```text
BLOCKED — database access unavailable.
```

Do not assume the records are correct.

---

# 9. RLS TESTS

If RLS behavior cannot be completely verified from the current environment:

Do not disable RLS.

Do not weaken security policies just to make a test pass.

Report:

```text
RLS CODE/POLICY REVIEW → PASS or FAIL
LIVE RLS VERIFICATION → BLOCKED/NOT TESTED
```

---

# 10. IF YOU FIND A BUG, FIX IT BEFORE REPORTING

Do not simply identify an authentication bug and then say it exists.

Follow:

```text
Find bug
↓
Understand root cause
↓
Fix code/configuration
↓
Re-run available test
↓
Confirm result
↓
Report result
```

If the fix cannot be verified:

```text
FIX IMPLEMENTED
VERIFICATION → BLOCKED
```

Do not call it fully fixed without verification.

---

# 11. DO NOT MODIFY WORKING CODE JUST TO MAKE A TEST PASS

If a test is blocked because of:

- Supabase configuration
- email provider
- SMS provider
- production environment
- deployment
- missing credentials
- external service

do NOT create a fake workaround.

Keep the real authentication architecture.

---

# 12. FINAL TEST REPORT FORMAT

At the end, provide a table like this:

| Test | Status | Evidence / Reason |
|---|---|---|
| User signup | PASS/FAIL/BLOCKED | Actual result |
| User login | PASS/FAIL/BLOCKED | Actual result |
| User wrong password | PASS/FAIL/BLOCKED | Actual result |
| User refresh | PASS/FAIL/BLOCKED | Actual result |
| User logout | PASS/FAIL/BLOCKED | Actual result |
| User login again | PASS/FAIL/BLOCKED | Actual result |
| Owner signup | PASS/FAIL/BLOCKED | Actual result |
| Owner login | PASS/FAIL/BLOCKED | Actual result |
| Owner refresh | PASS/FAIL/BLOCKED | Actual result |
| Owner logout | PASS/FAIL/BLOCKED | Actual result |
| Owner login again | PASS/FAIL/BLOCKED | Actual result |
| Admin login | PASS/FAIL/BLOCKED | Actual result |
| Admin refresh | PASS/FAIL/BLOCKED | Actual result |
| Admin logout | PASS/FAIL/BLOCKED | Actual result |
| Admin login again | PASS/FAIL/BLOCKED | Actual result |
| Role protection | PASS/FAIL/BLOCKED | Actual result |
| RLS | PASS/FAIL/BLOCKED | Actual result |
| Real email/OTP | PASS/FAIL/BLOCKED | Actual result |
| Production deployment | PASS/FAIL/BLOCKED | Actual result |

---

# 🚨 FINAL RULE

**NEVER FABRICATE TEST RESULTS.**

If AI Studio cannot test something:

**SAY IT IS UNTESTABLE/BLOCKED.**

Then:

1. Verify everything that CAN be verified.
2. Fix all confirmed bugs.
3. Explain exactly what remains unverified.
4. Give me the exact manual test required to verify the remaining item.

The goal is:

**REAL FIX + HONEST VERIFICATION, NOT A FAKE "ALL TESTS PASSED" REPORT.**

---

# 19. MANDATORY OWNER SIGN-UP DEBUG REPORT

After completing the Owner Sign-Up fix, generate a clear **Owner Sign-Up Debug Report**.

Do NOT simply say "fixed" or "working."

The report must contain:

## A. ROOT CAUSE
Explain the actual reason the Owner Sign-Up was failing.

Example categories:
- Frontend form issue
- Supabase Auth issue
- Database insert issue
- RLS policy issue
- Role assignment issue
- Session issue
- Redirect issue
- Validation issue
- Duplicate-account handling issue
- Configuration/environment issue

If multiple issues exist, list each one separately.

## B. FILES INSPECTED

List every relevant file inspected, for example:

- Owner Sign-Up component/page
- Owner Login component/page
- Authentication service
- Supabase client
- Database/profile service
- Role/authorization logic
- Routing/protected-route logic

Do not list files that were not actually inspected.

## C. FILES CHANGED

List only files that were actually modified.

For each changed file, explain briefly:

- What was wrong
- What was changed
- Why the change was necessary

## D. SUPABASE CHECK

Report the status of:

- Supabase connection
- Authentication configuration
- Owner profile table
- User ID relationship
- Role field
- Owner role value
- Required database fields
- Foreign keys
- RLS policies
- Duplicate-account handling
- Session handling

Use clear statuses:

`PASS`
`FIXED`
`WARNING`
`NOT VERIFIED`

Do not claim `PASS` if it could not actually be tested.

## E. OWNER SIGN-UP FLOW CHECK

Report each step:

1. Owner opens Sign Up
2. Form validation
3. Submit
4. Supabase Auth account creation
5. Owner profile creation
6. Owner ID relationship
7. Owner role assignment
8. Email verification handling
9. Session handling
10. Redirect
11. Owner Login
12. Owner Dashboard access

For each step show:

`PASS / FIXED / FAILED / NOT VERIFIED`

and provide a short explanation.

## F. AUTHENTICATION TESTS

Report results for:

| Test | Result |
|---|---|
| New Owner Registration | PASS / FAILED / NOT VERIFIED |
| Existing Email | PASS / FAILED / NOT VERIFIED |
| Invalid Email | PASS / FAILED / NOT VERIFIED |
| Weak Password | PASS / FAILED / NOT VERIFIED |
| Wrong Password Login | PASS / FAILED / NOT VERIFIED |
| Correct Owner Login | PASS / FAILED / NOT VERIFIED |
| Logout | PASS / FAILED / NOT VERIFIED |
| Session After Refresh | PASS / FAILED / NOT VERIFIED |
| Owner Role Verification | PASS / FAILED / NOT VERIFIED |
| User/Owner Separation | PASS / FAILED / NOT VERIFIED |
| Owner/Admin Separation | PASS / FAILED / NOT VERIFIED |

## G. SECURITY CHECK

Confirm whether the implementation:

- Uses Supabase Auth correctly
- Does not store plaintext passwords
- Does not expose service-role credentials
- Does not disable RLS globally
- Does not rely only on frontend role checks
- Does not use fake/demo authentication

Mark each item:

`PASS / FAILED / NOT VERIFIED`

## H. DESIGN PRESERVATION CHECK

Confirm:

- Existing Owner Sign-Up UI preserved
- Existing Owner Login UI preserved
- Existing User UI preserved
- Existing Admin UI preserved
- Existing header preserved
- Existing footer preserved
- Existing colors preserved
- Existing typography preserved
- Existing layout preserved
- Existing unrelated features preserved

Any accidental design changes must be reverted before finishing.

## I. REMAINING ISSUES

If anything remains unresolved, list it clearly.

Do NOT hide errors.

For every unresolved issue provide:

- Problem
- Reason
- Required action
- Whether it blocks Owner Sign-Up

If everything is verified, explicitly state:

`No known Owner Sign-Up issues remain.`

## J. FINAL STATUS

End the report with exactly one of:

### `OWNER SIGN-UP: VERIFIED WORKING`

Only use this if the complete flow was actually tested successfully.

OR

### `OWNER SIGN-UP: FIXED — REAL TESTING REQUIRED`

Use this when the code was fixed but Google AI Studio could not perform the required real Supabase/browser test.

OR

### `OWNER SIGN-UP: NOT FIXED`

Use this if the underlying issue remains.

**IMPORTANT:** Never falsely report a successful test. Clearly distinguish between code inspection, code changes, and real runtime testing.
