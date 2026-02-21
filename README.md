# 🌊 Bottled — Message in a Bottle, for the entire world

> *"Throw your words into the sea. Someone, somewhere, will find them."*

Bottled is a free, anonymous and global web service where anyone can throw a message into the digital sea — or find one washed up on their shore. No account. No email. No name. Just words, drifting across the world.

![Status](https://img.shields.io/badge/status-in%20development-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Cost to run](https://img.shields.io/badge/cost-free-brightgreen)

---

## ✨ What is Bottled?

Two actions. That's it.

- **Throw a bottle into the sea** — write a message and cast it into the world
- **Find a bottle on the shore** — receive a random message from a stranger

No replies. No likes. No followers. You throw something into the sea and let it go. Someone finds it and takes it in. The beauty is in the simplicity and the mystery.

---

## 🚀 Live Demo

> Coming soon — [bottled.world](https://bottled.world)

---

## 🛠️ Tech Stack

| Layer | Technology | Hosting | Cost |
|---|---|---|---|
| Frontend | HTML / CSS / Vanilla JS | Vercel | Free |
| Backend | Node.js Serverless Functions | Vercel Functions | Free |
| Database | PostgreSQL | Supabase | Free |
| Moderation | OpenAI Moderation API | OpenAI | Free |
| Version Control | Git | GitHub | Free |

**Total running cost: $0/month** (optional custom domain ~€10/yr)

---

## 📁 Project Structure

```
bottled/
├── public/                  # Static frontend assets
│   ├── index.html           # Landing page
│   ├── write.html           # Write a message
│   ├── read.html            # Read a message
│   ├── about.html           # About + privacy policy
│   ├── css/
│   │   ├── main.css         # Global styles
│   │   ├── animations.css   # Ocean & bottle animations
│   │   └── typography.css   # Font definitions
│   └── js/
│       ├── main.js          # Core logic
│       ├── animations.js    # Animation handlers
│       └── api.js           # API calls
├── api/                     # Vercel serverless functions
│   ├── send.js              # POST /api/send
│   ├── receive.js           # GET /api/receive
│   └── status/
│       └── [id].js          # GET /api/status/:id
├── lib/
│   ├── supabase.js          # Supabase client
│   └── moderation.js        # OpenAI moderation helper
├── .env.example             # Example environment variables
├── vercel.json              # Vercel configuration
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Supabase](https://supabase.com) account (free)
- An [OpenAI](https://platform.openai.com) account (free, for moderation API)
- A [Vercel](https://vercel.com) account (free, for deployment)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/bottled.git
cd bottled
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL editor and run the full schema from **[supabase/schema.sql](supabase/schema.sql)** (messages table, RLS, `get_random_message` RPC, rate-limiting table and `increment_send_count` RPC).
3. Copy your **Project URL** and **service_role key** from Settings → API

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

> ⚠️ **Never commit `.env.local` to Git.** It is already in `.gitignore`.

### 5. Run locally

If you haven’t already, log in to Vercel once (needed for `vercel dev`):

```bash
vercel login
```

Then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌍 Deployment

### Deploy to Vercel (recommended)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy — Vercel handles everything automatically

Every push to `main` triggers a new production deployment. Pull requests get automatic preview URLs.

### Custom domain (optional)

In Vercel → Settings → Domains, add your custom domain. Vercel handles SSL automatically and for free.

---

## 🔌 API Reference

### `POST /api/send`

Send a new message.

**Request body:**
```json
{
  "text": "Your message to the world (max 1000 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-of-message"
}
```

**Error (content flagged):**
```json
{
  "success": false,
  "error": "Content not allowed"
}
```

---

### `GET /api/receive`

Receive a random message.

**Response:**
```json
{
  "text": "Message content",
  "date": "2026-02-15T10:30:00Z"
}
```

---

### `GET /api/status/:id`

Check if a specific message has been found (used with session cookie).

**Response:**
```json
{
  "found": true,
  "count": 3
}
```

---

## 🔒 Privacy

Bottled is designed from the ground up to collect **zero personal data**.

- ❌ No IP addresses stored
- ❌ No email addresses or usernames
- ❌ No device information or user agent
- ❌ No location data
- ✅ Only an anonymous UUID session cookie (24h lifetime, browser-only)
- ✅ Message text is stored anonymously with no link to any person

Because no personal data is collected, Bottled operates outside the scope of GDPR's core requirements. See [/about](https://bottled.world/about) for the full privacy policy.

---

## 🛡️ Content Moderation

All incoming messages are automatically screened by the [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation) before being saved. Messages containing hate speech, explicit content, violence, or harassment are rejected automatically.

Rate limiting is applied at the edge (Vercel Edge Middleware): **max 5 messages per IP per hour**.

Admins can flag individual messages manually via the Supabase dashboard.

---

## 🎨 Design

| Element | Details |
|---|---|
| Primary font | [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) — headings & logo |
| Body font | [Lora](https://fonts.google.com/specimen/Lora) — message content |
| UI font | [Inter](https://fonts.google.com/specimen/Inter) — navigation & buttons |
| Primary color | `#1A3A5C` Deep Ocean |
| Accent color | `#4A9EBF` Sea Glass |
| Background | `#F5EDD6` Sand |

All fonts are free via Google Fonts.

---

## 🗺️ Roadmap

### v1.0 — MVP
- [x] Project specification
- [ ] Landing page with ocean animation
- [ ] Write & send flow with moderation
- [ ] Receive flow with bottle animation
- [ ] Session cookie (24h)
- [ ] Privacy policy / About page
- [ ] Rate limiting
- [ ] Deploy to Vercel

### v1.1 — Polish
- [ ] Live counter ("X bottles drifting right now")
- [ ] Report button on read view
- [ ] Multilingual support
- [ ] Accessibility improvements (prefers-reduced-motion)

### Future ideas
- [ ] Themed bottles with mood/wax seal colours
- [ ] Geographic filter (receive a bottle from a specific region)
- [ ] Time capsule mode (sealed for 30 days)
- [ ] Rare bottles (only appear once)
- [ ] Dark mode (night sea aesthetic)

---

## 🤝 Contributing

Contributions are welcome! If you have an idea, found a bug, or want to improve something:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your PR includes a clear description of what it does and why.

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

## 💙 Acknowledgements

Inspired by the timeless human act of putting a message in a bottle and casting it into the unknown.

> *"The sea doesn't care who you are. Neither does Bottled."*
