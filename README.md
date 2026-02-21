# Bottled

> *"Throw your words into the sea. Someone, somewhere, will find them."*

Bottled is a free, anonymous web app where anyone can throw a message into the digital sea — or find one washed up on shore. No account. No email. No name. Just words, drifting across the world.

**Try it now** — [bottled-kappa.vercel.app](https://bottled-kappa.vercel.app/)

![License](https://img.shields.io/badge/license-MIT-green)

---

## What is it?

Two actions. That's it.

- **Throw a bottle into the sea** — write a message and cast it into the world
- **Find a bottle on the shore** — receive a random message from a stranger

No replies. No likes. No followers. You throw something into the sea and let it go. Someone finds it and takes it in. The beauty is in the simplicity and the mystery.

---

## Features

- **Night sea landing page** — an atmospheric scene with stars, moon, animated waves, and a floating bottle
- **Mood seals** — tag your bottle with a mood (hopeful, lonely, grateful, curious, peaceful, adventurous, quiet, brave) shown as coloured wax seals
- **Time capsules** — seal a bottle for up to 365 days; nobody can open it until then
- **Rare bottles** — mark a bottle so only one person can ever find it
- **Keep a bottle** — download any message you find as a PNG image
- **Dark / light mode** — toggle between a warm sand daytime look and the full night-sea aesthetic
- **Ocean sound** — optional ambient background audio
- **Live counter** — see how many bottles are drifting right now
- **Report system** — flag inappropriate messages for admin review
- **Admin dashboard** — statistics, mood breakdown, message browser with search and filters, flagged message management
- **Fresh bottles** — the app remembers what you've already read so you always get something new
- **Zero personal data** — no accounts, no tracking, no IP storage

---

## How it's built

Bottled runs entirely on free-tier services.

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend | Node.js serverless functions (Vercel) |
| Database | PostgreSQL (Supabase) |
| Moderation | OpenAI Moderation API |
| CI | GitHub Actions |

No frameworks, no build step. The frontend is plain HTML/CSS/JS served as static files. The backend is a handful of serverless functions. The whole thing deploys on push to `main`.

---

## Project structure

```
bottled/
├── public/                     Static frontend
│   ├── index.html              Landing page (night scene)
│   ├── write.html              Throw a bottle
│   ├── read.html               Find a bottle
│   ├── about.html              About + privacy
│   ├── status.html             Check your bottle
│   ├── admin.html              Admin dashboard
│   ├── css/
│   │   ├── main.css            Design tokens & global styles
│   │   ├── scene.css           Night sea scene (stars, moon, waves)
│   │   ├── animations.css      Ocean & bottle animations
│   │   ├── admin.css           Admin dashboard styles
│   │   └── typography.css      Google Fonts imports
│   └── js/
│       ├── api.js              API client (send, receive, report, status)
│       ├── write.js            Write form logic
│       ├── read.js             Find & display messages
│       ├── admin.js            Admin dashboard logic
│       ├── scene.js            Star field & parallax
│       ├── theme.js            Dark / light toggle
│       ├── sound.js            Ambient ocean audio
│       ├── quotes.js           Random quotes
│       ├── count.js            Live bottle counter
│       ├── animations.js       Wave & reveal animations
│       └── main.js             Nav highlighting & mobile menu
├── api/                        Vercel serverless functions
│   ├── send.js                 POST /api/send
│   ├── receive.js              POST /api/receive
│   ├── report.js               POST /api/report
│   ├── count.js                GET  /api/count
│   ├── status/[id].js          GET  /api/status/:id
│   └── admin/
│       ├── stats.js            GET  /api/admin/stats
│       ├── messages.js         GET  /api/admin/messages
│       └── flagged.js          GET|PATCH /api/admin/flagged
├── lib/
│   ├── supabase.js             Database client
│   ├── moderation.js           OpenAI moderation
│   ├── rate-limit.js           IP rate limiting (5/hour)
│   └── adminAuth.js            Admin secret auth
├── supabase/
│   ├── schema.sql              Full database schema
│   └── migrations/             Incremental migrations
├── test/                       Jest API tests
├── .env.example                Environment variable template
└── vercel.json                 Routing & CORS config
```

---

## Privacy

Bottled collects **zero personal data**.

- No IP addresses stored
- No accounts, emails, or usernames
- No device fingerprinting or tracking
- Messages are stored anonymously with no link to any person
- A short-lived session cookie (24h) lets you optionally check if your bottle was found

---

## Content moderation

Every message is screened by the OpenAI Moderation API before it's saved. Hate speech, explicit content, violence, and harassment are automatically rejected. Users can also report messages from the read view, and admins can review flagged content from the admin dashboard.

Rate limiting prevents abuse: max 5 messages per IP per hour.

---

## Design

The visual language is built around the ocean metaphor:

| | |
|---|---|
| **Headings** | Playfair Display |
| **Body text** | Lora |
| **UI** | Inter |
| **Dark mode** | Deep navy night sea with stars, moon, and animated waves |
| **Light mode** | Warm sand tones with subtle ocean gradients |
| **Accent** | Sea glass blue `#4A9EBF` |

---

## Running locally

```bash
git clone https://github.com/joenb33/Bottled.git
cd Bottled
npm install
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY
npm run dev
```

Requires Node.js 18+ and a one-time `vercel login` for the local dev server.

---

## Tests

```bash
npm test
```

41 API tests covering send, receive, report, count, status, and all admin endpoints. Tests run on every push via GitHub Actions.

---

## Contributing

Contributions are welcome. Fork the repo, create a branch, and open a pull request.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

> *"The sea doesn't care who you are. Neither does Bottled."*
