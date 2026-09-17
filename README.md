<div align="center">

# 🌱 FieldSnapAdvisor

### AI-powered field diagnosis and advisory assistant for farmers

<p>
  A modern web application that helps farmers diagnose crop issues, get weather insights, and access AI-driven recommendations — built with React, TypeScript, and the Gemini API.
</p>

<p>
  <img src="https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React + TypeScript">
  <img src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Gemini%20API-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini API">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Project Status">
</p>

[Features](#-features) •
[Tech Stack](#️-tech-stack) •
[Getting Started](#-getting-started) •
[Project Structure](#-project-structure) •
[Contributing](#-contributing) •
[Contact](#-contact)

</div>

---

## 📖 About the Project

**FieldSnapAdvisor** is a web application that helps farmers and field workers quickly diagnose crop or plant issues using photos, guided questionnaires, and AI-powered analysis. It combines a rule-based diagnosis engine with the **Gemini API** to deliver actionable recommendations, and includes supporting tools such as a weather widget, a savings ("Bachat") calculator, and multi-language support.

The project was scaffolded with **Google AI Studio** and is built on a modern **React + TypeScript + Vite** stack for fast local development.

---

## ✨ Features

- 📷 **Camera-based capture** — snap a photo of a plant or field issue directly from the browser
- 🔍 **Guided diagnosis wizard** — step-by-step flow that narrows down the likely issue
- 📝 **Smart questionnaire** — collects relevant context to improve diagnosis accuracy
- 🤖 **AI-powered image analysis** — uses the Gemini API to analyze crop/plant images
- 🌦️ **Live weather widget** — surfaces weather data relevant to field decisions
- 🌾 **Plot management** — track multiple plots with individual details and history
- 💰 **Bachat (savings) calculator** — estimate cost savings from recommended actions
- 🎙️ **Speech support** — voice-based interaction for accessibility
- 🌐 **Multi-language support** — translation service for wider farmer reach
- 💾 **Local storage** — persists user data and plot information across sessions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| ⚛️ **React** | User interface |
| 📘 **TypeScript** | Type-safe development |
| ⚡ **Vite** | Development server & build tooling |
| 🤖 **Gemini API** | AI-powered image analysis & recommendations |
| 🎨 **CSS** | Interface styling |

---

## 📁 Project Structure

```text
FieldSnapAdvisor/
│
├── src/
│   ├── components/
│   │   ├── BachatCalculatorModal.tsx   # Savings calculator modal
│   │   ├── CameraCapture.tsx           # Camera capture interface
│   │   ├── DiagnosisWizard.tsx         # Guided diagnosis flow
│   │   ├── Navbar.tsx                  # Navigation bar
│   │   ├── OnboardingModal.tsx         # First-time user onboarding
│   │   ├── PlotDetail.tsx              # Single plot detail view
│   │   ├── PlotList.tsx                # List of user plots
│   │   ├── Questionnaire.tsx           # Diagnostic questionnaire
│   │   ├── ResultScreen.tsx            # Diagnosis result display
│   │   └── WeatherWidget.tsx           # Weather information widget
│   │
│   ├── services/
│   │   ├── imageAnalysis.ts            # Gemini-powered image analysis
│   │   ├── ruleEngine.ts               # Rule-based diagnosis logic
│   │   ├── speech.ts                   # Speech/voice functionality
│   │   ├── storage.ts                  # Local storage utilities
│   │   ├── translations.ts             # Multi-language support
│   │   └── weather.ts                  # Weather data service
│   │
│   ├── App.tsx                         # Root application component
│   ├── index.css                       # Global styles
│   ├── main.tsx                        # Application entry point
│   └── types.ts                        # Shared TypeScript types
│
├── .env.example                        # Sample environment variables
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── README.md
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes bundled with Node.js)
- A [Gemini API key](https://ai.google.dev/) (free tier available)

### 1. Clone the repository

```bash
git clone https://github.com/pawani28/FieldSnapAdvisor.git
cd FieldSnapAdvisor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root (you can copy `.env.example` as a starting point) and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

> 🔐 **Security note:** Never commit your real API key to GitHub. `.env.local` is already covered by `.gitignore`.

### 4. Start the development server

```bash
npm run dev
```

Vite will print a local URL in the terminal — open it in your browser to view the app.

### 5. Build for production

```bash
npm run build
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | API key used to access the Gemini API for image analysis |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📌 Project Status

🚧 **Actively being developed** — the interface, components, and functionality are being refined as the project evolves. Feedback and suggestions are appreciated.

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it with attribution.

---

## 👩‍💻 Author

**Pawani Chandel**
B.Tech, Computer Science & Technology (Data Science) — Pranveer Singh Institute of Technology (AKTU)

- 💼 [LinkedIn](https://linkedin.com/in/pawani-chandel-123000341)
- 🐙 [GitHub](https://github.com/pawani28)
- ✉️ pawanichandel71@gmail.com

---

<div align="center">

### 🌱 FieldSnapAdvisor

**Built with React • TypeScript • Vite • Gemini API**

⭐ If you find this project useful, consider giving it a star!

</div>
