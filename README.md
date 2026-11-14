# Personal-portfolio

Portfolio website of Sayed Rafiad Hossan, Frontend Developer.

Built with Next.js 16, React 19, Tailwind CSS 4, GSAP and Lenis smooth scrolling.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

## Editing content

Name, links, projects, experience and skills all live in `src/data/data.ts`.
Images go in `public/images`.

## Contact form

The contact form sends email through EmailJS. The EmailJS IDs are set as defaults in
`src/lib/emailjs/config.ts` (they are public by design), so no setup is needed to deploy.
To use different ones, set these in `.env.local` or your host's environment settings:

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
RECAPTCHA_SECRET_KEY=
```
