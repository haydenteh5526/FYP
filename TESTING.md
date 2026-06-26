# Testing Guide — DocVault

## Prerequisites

- Docker Desktop running
- Node.js 20+ installed
- A document photo ready (phone manual, warranty card, anything with text)

---

## Step 1: Start the Backend

```bash
cd C:\FYP
docker compose up --build -d
```

Wait ~30 seconds, then verify:
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"ok"}`

## Step 2: Run Database Migration

```bash
docker compose exec api alembic upgrade head
```

## Step 3: Start the Frontend

```bash
cd C:\FYP\frontend
npm run dev
```

Open http://localhost:3000

---

## Step 4: Test Registration

1. Click **"Get started"** on landing page
2. Enter email: `haydenteh0@gmail.com` (to receive real Resend email) OR any email
3. Click **"Continue with Email"**
4. Enter your full name
5. Enter a password — watch the **strength meter** fill (aim for green)
6. Click **"Create account"**
7. You'll see **"Check your email"** screen

### Get the verification link:

**If using haydenteh0@gmail.com:** Check your Gmail inbox (or spam).

**If using any other email:** The link prints to Docker logs:
```bash
docker compose logs api --tail 10
```
Look for:
```
📧 EMAIL (dev mode)
To: your@email.com
URL: http://localhost:3000/verify?token=XXXXX
```

8. Open that URL in your browser
9. You should see **"Email verified!"** with a green checkmark

## Step 5: Test Login

1. Go to http://localhost:3000/login
2. Enter your email → "Continue with Email"
3. Enter your password → "Sign in"
4. You should land on the **Dashboard**

## Step 6: Test Document Upload

1. Click **"Upload"** in the sidebar (or the Upload button on dashboard)
2. Drag and drop an image of a document (or click "Choose file")
   - Use a real photo: phone manual, receipt, warranty card, spec sheet
   - Must be JPEG, PNG, WebP, or PDF
3. Wait for the spinner — "Processing..."
4. Should show **"Uploaded successfully"** with the detected title/brand
5. Click **"View"** to see the document detail

## Step 7: Test Document Detail

1. Click the **"Text"** tab — verify OCR extracted readable text
2. Click **"Edit text"** — make a correction → Save
3. Click **"Image"** tab — see the original uploaded image
4. Click **"Info"** tab — see brand, model, type, file size, date

## Step 8: Test Dashboard

1. Click **"Documents"** in sidebar to go back
2. Your document card should appear with brand/type badges
3. Try the **filter bar** — type part of the title
4. Hover a card — trash icon appears (don't delete yet)

## Step 9: Test Search

1. Click **"Search"** in sidebar
2. Type a word you KNOW is in your uploaded document
3. Click Search
4. Should return results with relevant text excerpts

> Note: Without an OpenAI API key, semantic search uses zero-vectors (all results show 0% relevance). The keyword search still works.

## Step 10: Test Ask AI

1. Click **"Ask AI"** in sidebar
2. Click one of the suggested questions, or type your own
3. Should return an answer (in dev mode: shows raw document text)
4. Source citations appear below the answer

> Note: Real AI answers require `OPENAI_API_KEY` in your `.env` file.

## Step 11: Test Categories

1. Click **"Categories"** in sidebar
2. If auto-categorisation worked, a category may already exist
3. Type a name (e.g., "Electronics") and click the + button
4. Category appears in the list

## Step 12: Test Sign Out

1. Click **"Sign out"** at the bottom of the sidebar
2. Should return to the landing page
3. Try going to http://localhost:3000/app — should redirect to /login

---

## Common Issues

| Problem | Solution |
|---------|----------|
| "Server unavailable" | Backend not running. Run `docker compose up --build -d` |
| 500 error on register | Run migration: `docker compose exec api alembic upgrade head` |
| "Email already registered" | Use a different email, or delete: `docker compose exec db psql -U docvault -c "DELETE FROM users WHERE email = 'xxx';"` |
| "Please verify your email" | Check logs for verify URL: `docker compose logs api --tail 10` |
| OCR text is empty | Image too blurry or small. Try a clearer photo |
| Search shows 0% relevance | Expected without OpenAI key. Keyword search still works |
| AI answer shows raw text | Expected without OpenAI key. Set it in `.env` for real answers |
| Can't see frontend changes | Run frontend locally: `cd frontend && npm run dev` |

---

## Optional: Enable Real AI

Add to `C:\FYP\.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

Rebuild: `docker compose up --build -d`

Now search uses real embeddings and Ask AI generates proper answers via GPT-4o-mini.

---

## Optional: Enable Real Email (Resend)

Already configured. Works with `haydenteh0@gmail.com` (your Resend account email).
For other emails, verify a domain at https://resend.com/domains.
