# Adithya Ram S Portfolio

Welcome to my personal portfolio! This web application showcases my projects, skills, certifications, academic timeline, and ways to get in touch. It is a single static page with no build step.

---

## Features

- **Scroll-driven particle scene:** about 26,000 WebGL particles sit behind the page and reshape themselves for each section (FPGA chip, wheel, leaf, signal in noise, sensor mesh, helix, vortex). They tilt toward and scatter around the pointer. Written directly against WebGL in `scene.js`, no libraries.
- **Live lock-in amplifier demo:** a small signal-processing simulation with adjustable noise and filter time constant (`index.js`).
- **Motion:** letter-by-letter name on load, scroll reveals, a ticker.
- **Responsive and accessible:** works down to phone widths, keyboard focus styles, and a still mode for people who prefer reduced motion.
- **No external dependencies:** plain HTML, CSS and JavaScript; fonts are self-hosted in `/fonts`.

To give a section its own shape, set `data-shape` (and `data-side="left|right|center"`) on its `<section>` in `index.html`.

---

## Technologies Used

- HTML5, CSS3, vanilla JavaScript (WebGL and Canvas 2D)
- Saira Condensed and IBM Plex Sans (SIL Open Font License, see `fonts/LICENSE.txt`)

---

## 📦 Installation

1. **Clone the repository:**

 ```bash
   git clone https://github.com/Adk-157/Portfolio-website.git
   ```
2. **Open the site:**
- Open `index.html` directly in your browser.

---

## 💡 Usage

- Browse through the site for **Personal Statement, Education, Experience, Projects, Skills, Certifications, Extracurriculars, and Contact**.
- Download the resume or connect via social links in the contact section.

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
