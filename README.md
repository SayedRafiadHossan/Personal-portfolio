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

The contact form sends email through EmailJS and checks submissions with reCAPTCHA.
Add these to a `.env.local` file (it is git-ignored):

```
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
RECAPTCHA_SECRET_KEY=
```
