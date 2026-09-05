# MediConnect Telehealth & Doctor Consultation Platform

A modern, production-grade Telehealth and Doctor Consultation dashboard built with **Next.js 14+ (App Router)**, **Tailwind CSS**, **WebRTC video simulation**, and a **Voice-Enabled AI Clinical Assistant** powered by the **Web Speech API** (Speech-to-Text & Text-to-Speech) and OpenAI API architecture.

---

## 🌟 Key Features

### 1. 📋 Responsive Split-Screen Layout
- **Left Panel (Doctor Directory Sidebar)**:
  - Vertically scrollable list of doctors with real-time status indicators (Online, Busy, Offline).
  - Search by doctor name, specialty, or hospital.
  - Specialty filtering pills (*Cardiologist, Dermatologist, General Physician, Neurologist, Pediatrician, Psychiatrist, etc.*).
  - One-click **"Consult Now"** button with automatic selection and video room connection.
  - Mobile-responsive slide-out drawer on smaller viewports.

### 2. 📹 Real-Time Video Consultation Workspace
- **Doctor Video Feed**: High-definition simulated consultation stream with animated speaking audio indicators, latency metrics, and HIPAA/E2E encryption badges.
- **Picture-in-Picture Patient View**: Real webcam stream integration via `navigator.mediaDevices.getUserMedia` with fallback simulated avatar.
- **Interactive Call Controls Bar**:
  - 🎙️ **Mute / Unmute Audio**: Audio input control.
  - 📷 **Camera On / Off**: Video stream toggles.
  - 🖥️ **Screen Share**: EHR / medical record sharing overlay.
  - 🔊 **Speaker Mute / Unmute**: Audio output toggle.
  - 🛑 **End Call / Start Video Call**: Session lifecycle manager.
- **Live Call Timer**: Real-time consultation duration tracker.

### 3. 🎙️ Voice-Enabled AI Assistant (Dr. Aria)
- **Speech-to-Text (STT)**: Microphone button using the native **Web Speech API** (`webkitSpeechRecognition` / `SpeechRecognition`) with real-time interim speech transcription preview.
- **Text-to-Speech (TTS)**: Audible spoken responses using `window.speechSynthesis` with voice selection, speech controls, and an **Auto-Readout Toggle**.
- **Voice Waveform Equalizer**: Dynamic animated audio wave visualizer when listening to patient voice or speaking responses aloud.
- **Triage & Clinical Recommendations**: Integrates with `/api/ai/chat` (supports OpenAI API key with a fallback clinical rule engine for offline/immediate testing).
- **Quick Clinical Triage Chips**: One-click quick questions (*"Check Fever & Cough"*, *"Headache & Light Sensitivity"*, *"Medication Questions"*, *"Skin Rash Triage"*).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or later
- Modern browser (Google Chrome, Microsoft Edge, or Apple Safari recommended for Web Speech API support)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure OpenAI API Key (Optional)**:
   Copy `.env.example` to `.env.local` and add your OpenAI API key if you wish to use OpenAI LLM generation:
   ```bash
   cp .env.example .env.local
   ```
   *(If omitted, the platform seamlessly uses its built-in medical triage intelligence engine).*

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Architecture

```
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── chat/
│   │           └── route.ts         # OpenAI chat completion / clinical triage engine
│   ├── globals.css                  # Custom scrollbars, waveforms & medical theme
│   ├── layout.tsx                   # Root HTML layout & metadata
│   └── page.tsx                     # Main Dashboard page (Split-screen container)
├── components/
│   ├── consultation/
│   │   ├── VideoRoom.tsx            # Main video consultation container & live stream
│   │   ├── VideoControls.tsx        # Call actions (Mic, Camera, Screen share, End call)
│   │   └── ParticipantBadge.tsx     # Latency, doctor credentials, and security badges
│   ├── doctors/
│   │   ├── DoctorCard.tsx           # Individual doctor card with status, fee, rating
│   │   └── DoctorList.tsx           # Left sidebar with search & specialty filter pills
│   ├── ai-assistant/
│   │   ├── VoiceAssistant.tsx       # AI chat interface with STT & TTS integration
│   │   ├── VoiceVisualizer.tsx      # Dynamic animated audio wave indicator
│   │   ├── ChatMessage.tsx          # Chat bubbles with quick replay audio button
│   │   └── QuickPrompts.tsx         # Medical quick triage suggestions
│   └── layout/
│       └── Header.tsx               # Top navigation bar with emergency hotline & badges
├── data/
│   └── doctors.ts                   # Realistic mock doctor database
├── types/
│   ├── doctor.ts                    # TypeScript definitions for Doctor & Specialty
│   └── consultation.ts              # TypeScript definitions for Chat, Call & Voice state
├── utils/
│   └── speech.ts                    # Web Speech API wrapper (STT + TTS)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

