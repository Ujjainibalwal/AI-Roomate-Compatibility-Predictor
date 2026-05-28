<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/house-with-garden_1f3e1.png" width="80" alt="RoomieAI Logo">
</p>

<h1 align="center">RoomieAI</h1>

<p align="center">
  <strong>AI-Powered Roommate Compatibility Predictor using Deep Learning</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Categories-8-7c3aed?style=for-the-badge" alt="8 Categories"></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/TensorFlow.js-4.17-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/Backend-None-06b6d4?style=for-the-badge" alt="No Backend"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge" alt="MIT License"></a>
</p>

<p align="center">
  A premium web application that runs a <strong>neural network entirely in the browser</strong> to predict how compatible you are with a potential roommate — no server required.
</p>

---

## ✨ Features

- 🧠 **Deep Learning Model** — A feedforward neural network built with TensorFlow.js, trained on-the-fly in ~2 seconds
- 📊 **8 Lifestyle Categories** — Sleep schedule, cleanliness, noise tolerance, social habits, temperature, work schedule, pet friendliness, and sharing
- ⚡ **Instant Prediction** — Results generated in-browser with zero network latency
- 🎯 **Category Breakdown** — Per-category compatibility scores with animated bar charts
- 💡 **AI Insights** — Dynamically generated tips based on your strongest and weakest compatibility areas
- 🏅 **Compatibility Badges** — From "💫 Soul Roommates" (90+) to "🔥 Oil & Water" (<25)
- 📋 **Share Results** — Copy your full compatibility report to clipboard
- 🎨 **Premium UI** — Dark glassmorphism design with particle background, gradient accents, and micro-animations
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🧠 Neural Network Architecture

```
Input Layer (16 features)
    ↓
Dense(64, ReLU) + Dropout(0.2)
    ↓
Dense(32, ReLU) + Dropout(0.15)
    ↓
Dense(16, ReLU)
    ↓
Dense(1, Sigmoid) → Compatibility Score (0–1)
```

| Detail | Value |
|--------|-------|
| **Framework** | TensorFlow.js (Layers API) |
| **Training Data** | 600 synthetic roommate pairs |
| **Optimizer** | Adam (lr=0.005) |
| **Loss** | Mean Squared Error |
| **Epochs** | 50 |
| **Training Time** | ~2 seconds (in-browser) |

The model is trained on synthetic data that encodes real-world compatibility heuristics — similar sleep schedules and cleanliness standards boost compatibility, while large differences in noise tolerance or social habits penalize it. Non-linear scoring ensures small differences are tolerated while extreme mismatches are heavily penalized.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **ML Engine** | [TensorFlow.js](https://www.tensorflow.org/js) v4.17 |
| **Frontend** | Vanilla HTML5 / CSS3 / JavaScript (ES6+) |
| **Styling** | Custom CSS with design tokens, glassmorphism, CSS animations |
| **Background FX** | Canvas-based particle system with mouse interaction |
| **Build Tools** | None — zero dependencies, no build step |

---

## 🚀 Getting Started

### Prerequisites

Any modern web browser (Chrome, Firefox, Safari, Edge) and a local HTTP server.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/roomie-ai.git
cd roomie-ai

# Serve with any static server
python3 -m http.server 8080

# Or use Node
npx serve .
```

Open **http://localhost:8080** in your browser.

> [!NOTE]
> The TensorFlow.js library is loaded from a CDN, so you need an internet connection on first load. After that, the neural network trains and runs entirely on your device.

---

## 📁 Project Structure

```
roomie-ai/
├── index.html       # Main HTML — 4-screen wizard layout
├── index.css        # Design system — tokens, components, animations
├── app.js           # App logic — navigation, forms, result rendering
├── model.js         # TF.js model — architecture, training, prediction
├── particles.js     # Canvas particle background system
└── README.md
```

---

## 🎮 How It Works

1. **Landing** — Hit "Get Started" to begin
2. **Your Profile** — Adjust 8 lifestyle sliders (sleep schedule, cleanliness, etc.)
3. **Roommate's Profile** — Fill in the same 8 sliders for your potential roommate
4. **AI Analysis** — The neural network processes both profiles and generates:
   - An overall compatibility score (0–100)
   - Per-category breakdown with animated bars
   - AI-powered tips for your strongest and weakest areas
   - A fun compatibility badge

---

## 📊 Categories Analyzed

| # | Category | What It Measures |
|---|----------|-----------------|
| 🌙 | **Sleep Schedule** | Bedtime preference (9 PM – 3 AM) |
| ✨ | **Cleanliness** | Tidiness standards (Relaxed → Spotless) |
| 🔊 | **Noise Tolerance** | Sound sensitivity (Silent → Loud & Lively) |
| 👥 | **Social Habits** | Guest frequency (Rarely → Very Often) |
| 🌡️ | **Temperature** | Ideal room temp (60°F – 80°F) |
| 💼 | **Work Schedule** | Productivity hours (Early Bird → Night Owl) |
| 🐾 | **Pet Friendliness** | Pet comfort level (No Pets → All Pets Welcome) |
| 🤝 | **Sharing** | Willingness to share belongings (Private → Share Everything) |

---

## 🎨 Design

Built with a **dark glassmorphism** aesthetic:

- Deep navy background (`#0a0e1a`) with floating glow orbs
- Purple → Cyan → Magenta gradient accents
- `backdrop-filter: blur()` glass cards
- Canvas particle system with mouse-reactive connections
- Staggered slide-in animations for cards
- Animated radial gauge with counter for the score reveal
- Custom range sliders with glowing thumb
- Fully responsive from mobile to ultrawide

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

- 🌍 Add internationalization (i18n)
- 📸 Add screenshot/social share cards
- 🏗️ Multi-roommate group compatibility
- 📈 Visualize training loss in real-time
- 🎭 Add personality type integration (MBTI, etc.)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with 🧠 TensorFlow.js and ☕ caffeine
</p>
