# iScrev

[Leia em Português](README.md)

---

## iScrev Notes

> A digital diary with the soul of a notebook.

iScrev Notes is a web application for personal notes and journaling that combines the simplicity of digital writing with the warmth and freedom of a physical notebook. Designed with a **local-first** philosophy, it ensures that all your data remains exclusively on your device, with no need for accounts, logins, or cloud connections.

The experience is focused on low distraction and high immersion, using a visual identity inspired by paper, ink, and editorial typography to create a comfortable and welcoming writing environment.

---

## ✨ Features

The main application, `diario.html`, offers an integrated set of tools for thinking and recording:

-   📝 **Hybrid Editor:** Write in plain text, format with **Markdown**, and add complex mathematical equations with **LaTeX** (`$...$` for inline and `$$...$$` for block).
-   ✒️ **Handwriting Pen:** Switch to "Pen" mode to draw, scribble, or take handwritten notes directly on the text area, using an SVG pen with stroke smoothing.
-   🔐 **Total Privacy (Local-First):** Your data is saved in your browser using IndexedDB, ensuring complete privacy and offline functionality.
-   💾 **Import and Export:** Back up your entries as `.md` files, which include embedded handwritten notes. You can also export to `.pdf` for sharing and printing.
-   🌐 **Multi-language:** The interface is available in Portuguese and English, with automatic detection based on your browser's language.
-   🚫 **Zero Hassle:** No frameworks, no build step, no external dependencies (except for fonts and KaTeX via CDN). Just open it in your browser and start using it.
-   📱 **Responsive Design:** The interface adapts for use on desktops, tablets, and smartphones.

## 🚀 How to Use iScrev Notes

The simplest and recommended way to use iScrev Notes is directly in your browser, without the need to download or configure servers.

1.  **Access the application online:**
    Visit the project's official website and click the link to open the diary. The application is designed to work immediately.

2.  **Start writing:**
    - Use the **"New Entry"** button in the sidebar to create your first note.
    - Write in the main editor. Use the toolbar buttons to format text with Markdown or insert equations with LaTeX.
    - Switch between **"Edit"**, **"Pen"**, and **"Preview"** modes to access different features.
    - Your notes are saved automatically in your browser.

> **Note for Developers:** If you have cloned the repository to run the project locally, remember that the files (`diario.html`, `diario.css`, `diario.js`) need to be served via HTTP due to modern browsers' security policies (CORS). Use a simple local server like `python -m http.server` or the "Live Server" extension in VS Code.

## 🛠️ Tech Stack

-   **HTML5**
-   **CSS3** (with CSS Variables for theming)
-   **JavaScript (ES5)** (vanilla, no frameworks, encapsulated in an IIFE)
-   **KaTeX** (for LaTeX rendering)
-   **SVG** (for the handwriting pen module)
-   **IndexedDB** (for local data persistence)