# 🌱 SDG Buddy

**Your personal, gamified tracker for contributing to the UN Sustainable Development Goals.**

---

## 🌍 Project Overview
**SDG Buddy** is a mobile and web application designed to translate the United Nations' 2030 Agenda for Sustainable Development into tangible, everyday actions.  

It serves as a personal tracker, enabling individuals to log their sustainable behaviors and quantify their contribution toward achieving the **17 Sustainable Development Goals (SDGs).**

Unlike apps that focus narrowly on environmental metrics, SDG Buddy takes a **holistic approach**, encompassing the full, interconnected spectrum of the SDGs — including social and economic goals such as:

- **Quality Education (SDG 4)**
- **Gender Equality (SDG 5)**
- **Reduced Inequalities (SDG 10)**

The ultimate goal is to **empower a global community** of users to understand, track, and amplify their personal impact on a sustainable future.

---

## ✨ Key Features
- **Holistic Action Logging**: Log daily activities across all 17 SDGs, from recycling and conserving water to volunteering and promoting equality.  
- **Gamified Motivation**: Stay engaged with points, streaks, badges, and leaderboards to make habit-building fun and rewarding.  
- **Impact Visualization**: A personal dashboard translates your actions into real-world, understandable metrics (e.g., *kg of CO₂ avoided*, *liters of water saved*).  
- **Community & Collaboration**: Form teams, participate in challenges, and see the collective impact of the entire SDG Buddy community.  
- **Educational Insights**: Learn about the specific SDG targets your actions contribute to and discover new ways to make a difference.  
- **Sleek & Modern UI**: A beautiful, tech-forward interface designed to inspire and delight users.  

---

## 🚀 Tech Stack
- **Framework**: Next.js (App Router)  
- **Library**: React  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS  

---

## 📸 Screenshots
> _(Placeholder: Add screenshots of your application here — e.g., login/signup screens and the main dashboard.)_

---

## 📂 Project Structure

sdg-buddy ├── app/              # Main application routes (pages, layouts, globals.css) ├── components/       # Reusable React components (e.g., LoginScreen, Dashboard) ├── lib/              # Utility functions and data (e.g., SDG data) ├── public/           # Static assets (images, fonts) ├── .eslintrc.json    # ESLint configuration ├── next.config.js    # Next.js configuration ├── package.json      # Project dependencies ├── tailwind.config.js# Tailwind CSS configuration └── tsconfig.json     # TypeScript configuration

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v18.x or later)  
- **npm** or **yarn**  

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sdg-buddy.git

2. Navigate to the project directory:
   ```bash
   cd sdg-buddy

3. Install dependencies:
   ```bash
   npm install

4. Create a `.env.local` file based on the provided `.env.example`, and fill in any required secrets and environment variables specific to your setup.

   For production email, set `RESEND_API_KEY` and use a verified `MAIL_FROM` address on your domain. Resend handles delivery, but your domain still needs to be verified in the Resend dashboard.

   Make sure the sending domain has SPF, DKIM, and DMARC configured, otherwise inbox delivery will be poor even if the API call succeeds.

5. Run the development server:
   ```bash
   npm run dev

6. Open http://localhost:3000 in your browser.

### Hugging Face Embeddings (optional)

This project can optionally use the Hugging Face Inference API for action embeddings. If you provide a Hugging Face API key, the app will call the configured model and fall back to a local embedder on error.

- Add the following to your `.env.local` (or environment for your deployment):

```bash
# Your Hugging Face Inference API key (optional)
HUGGINGFACE_API_KEY=hf_xxxYOURKEYxxx

# Optional: model to use for embeddings (default shown)
HUGGINGFACE_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

Examples — start the dev server with the env var set (PowerShell):

```powershell
$env:HUGGINGFACE_API_KEY="hf_xxxYOURKEYxxx"
npm run dev
```

Or on macOS / Linux (bash):

```bash
export HUGGINGFACE_API_KEY="hf_xxxYOURKEYxxx"
npm run dev
```

How to verify locally:

- Log in and use the app to "Log Action" (from the dashboard). The server route that saves actions calls `generateEmbedding`.
- If the embedding call to Hugging Face succeeds, the server will store the returned numeric vector; otherwise it will store the local fallback vector.
- You can inspect saved action documents in your database (e.g., MongoDB) to verify the `descriptionEmbedding` field has numeric values.

Troubleshooting:

- If you see failures from the Hugging Face API, the app will log the error and silently fall back to the local embedder.
- Ensure your Hugging Face quota and model name are correct for the selected model.




---

### 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are greatly appreciated.

If you have a suggestion to improve this project:

### 🤝 Fork the repo

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request


You can also simply open an issue with the tag enhancement.


---

### 📄 License

Distributed under the MIT License.
See the LICENSE file for more information.

---
