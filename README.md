<div align="center">
  <h1>Free Online Signature Maker</h1>
  <p><strong>A fast, privacy-first digital signature generator running 100% client-side in the browser.</strong></p>

  <p>
    <a href="https://free-signature-online.github.io/">Live Demo</a> •
    <a href="https://kisharadilshan.gumroad.com/coffee">Support Developer</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Astro-4.x-FF5D01?logo=astro&logoColor=white" alt="Astro" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Privacy-100%25_Client--Side-10B981" alt="Client Side Privacy" />
  </p>
</div>

---

## Highlights

- **Draw Mode:** Smooth, natural signature drawing powered by HTML5 Canvas with quadratic curve smoothing.
- **Stroke & Color Controls:** Selectable stroke thickness (Thin, Medium, Thick) and multiple ink options (Black, Blue, Red, or custom color picker).
- **Type Mode:** Generate realistic handwritten cursive signatures using an extensive selection of curated handwriting fonts.
- **Transparent PNG Export:** Instant one-click download formatted for direct placement on PDFs, Word files, and digital forms.
- **Local Storage Library:** Save frequently used signatures locally in your browser's private storage for quick re-use.
- **Privacy Guaranteed:** All processing happens entirely inside your browser. No files, coordinates, or images are ever transmitted to any external server.
- **Fully Responsive:** Touch-friendly canvas and UI optimized for mobile smartphones, tablets, and desktop displays.

---

## Tech Stack

- **Framework:** [Astro](https://astro.build/) (Static Site Generation)
- **Interactive UI:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Hosting & CI/CD:** GitHub Pages with GitHub Actions

---

## Project Structure

```text
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deployment workflow
├── public/
│   ├── favicon.svg         # Site favicon
│   └── robots.txt          # Crawler instructions
├── src/
│   ├── components/
│   │   └── SignatureTool.jsx # Interactive drawing & typing component
│   ├── layouts/
│   │   └── Layout.astro     # Global HTML shell, SEO metadata, and nav
│   └── pages/
│       └── index.astro      # Main landing page & FAQ structured data
├── astro.config.mjs        # Astro configuration & integrations
└── package.json            # Project dependencies and npm scripts
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/free-signature-online/free-signature-online.github.io.git
cd free-signature-online.github.io

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:4321` in your browser.

### Building for Production

```bash
# Generate static production build
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment

Automated deployment is configured using GitHub Actions (`.github/workflows/deploy.yml`). Pushing changes to the `main` branch automatically triggers the build and publishes the static output to GitHub Pages.

---

## Support & Feedback

If you find this project helpful, you can support ongoing maintenance and new tools:
- [Buy me a coffee on Gumroad](https://kisharadilshan.gumroad.com/coffee)
- Issues and feature suggestions are welcome via GitHub Issues.
