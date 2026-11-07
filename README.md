# SYNK LABS

<div align="center">

![SYNK LABS Logo](frontend/public/logo.png)

**Seamless, real-time, zero-login clipboard & file syncing across your screens.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-synk--labs.vercel.app-2B1A13?style=for-the-badge&logo=vercel)](https://synk-labs.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

</div>

---

## ⚡ Overview

**SYNK** is a fast, lightweight, and modern web application that lets you instantly beam text, code snippets, screenshots, images, and files between any of your devices—without logging in, installing software, or cluttering your messaging apps (WhatsApp, Slack, Telegram, or email).

Whether you need to beam a two-factor auth code from your phone to your PC, transfer a screenshot to your tablet, or drop a PDF across operating systems, SYNK makes it effortless.

🌐 **Live Application:** [synk-labs.vercel.app](https://synk-labs.vercel.app)

---

## ✨ Features

- **⚡ Real-Time Synchronous Sync:** Shared items broadcast instantly across all connected screens using low-latency WebSockets.
- **📋 Universal Clipboard:** Copy text or links on one device and click or tap to copy on any connected device.
- **📸 Screenshots & Image Pasting:** Native clipboard image support. Take a screenshot and press `Ctrl+V` (or tap the paste button on mobile) to upload and share immediately.
- **📁 File & Document Transfers:** Beam PDFs, documents, archives, and spreadsheets across devices with simple drag-and-drop or file upload.
- **📊 Live Session Capacity Progress Bar (1 GB Limit):** Visual progress bar prominently displayed during live sessions showing the total size of all shared content in real time.
- **🛡️ Smart Upload Guardrails (50 MB Max / File):** Enforces a clean single-file upload limit to ensure lightning-fast transfers across mobile and desktop connections.
- **📱 Instant QR Code Pairing:** Point your phone or tablet camera at the desktop screen to jump straight into the session in seconds.
- **🌓 Light & Dark Theme:** Switch seamlessly between an editorial warm ivory & espresso light theme and a deep slate & sand ivory dark theme. Preference is saved automatically.
- **👥 Active Device Presence:** Live presence indicator shows exactly how many devices are currently active in your session.
- **📱 Mobile Touch-Optimized:** Designed with a bottom floating action dock that uses native clipboard APIs, preventing unwanted virtual keyboard popups.

---

## 📊 Capacity & Transfer Limits

SYNK includes built-in real-time session limits to ensure optimal transfer speeds and fair storage usage:

| Specification | Limit | Description |
| :--- | :--- | :--- |
| **One-Time File Upload Limit** | **50 MB** | Maximum file size for an individual uploaded file or image |
| **Total Session Storage Limit** | **1 GB** | Maximum aggregate size of all files and content shared in a single session |
| **Progress Bar Indicator** | **Real-time** | Live storage meter in the session header showing bytes used, remaining capacity, and percentage |
| **Connected Devices** | **Unlimited** | Share simultaneously between PC, Mac, iPhone, iPad, Android, Linux, etc. |
| **Authentication** | **Zero Login** | No passwords, accounts, or emails required |

> 💡 **Tip:** If your session approaches the 1 GB total capacity, simply start a new 8-digit session for a fresh 1 GB storage allocation!

---

## 🚀 How to Connect & Use

Connecting two or more devices takes less than 5 seconds:

### Method 1: Scan QR Code (Fastest for Mobile)
1. Open [synk-labs.vercel.app](https://synk-labs.vercel.app) on your primary device (e.g. your computer) and click **Create Session**.
2. Click the **QR Code** button in the session header.
3. Open your mobile phone's camera and scan the QR code.
4. Your phone will open directly into the live session—ready to share!

### Method 2: 8-Digit Session ID
1. On your first device, click **Create Session** (or pick your own custom 8-digit code).
2. Note your 8-digit Session ID displayed in the top bar (e.g. `48291045`).
3. Open [synk-labs.vercel.app](https://synk-labs.vercel.app) on your other device, enter the 8-digit code, and click **Join Session**.
4. Both devices are now connected!

---

## 📥 Sharing Content

- **Paste Text or Code:** Copy text on your machine and press `Ctrl+V` (`Cmd+V` on Mac), or tap the **Tap to Paste** button on mobile.
- **Paste Screenshots:** Take a screenshot (e.g. `Win+Shift+S` or `Cmd+Shift+4`) and paste directly on the page.
- **Upload Files (up to 50 MB):** Click the **Paperclip icon** in the bottom dock or drag and drop any file directly onto the browser window.
- **Download on Other Devices:** Click or tap any shared card to copy text or download images and files.

---

## 🎨 Design & Themes

SYNK features an editorial, high-contrast aesthetic tailored for both daytime focus and late-night workflows:

- **Light Mode:** Warm ivory canvas (`#FAF8F5`), crisp white cards, rich espresso brown typography (`#1F1612`), and warm latte accents.
- **Dark Mode:** Deep slate-charcoal canvas (`#23272A`), dark graphite surface cards (`#2E3337`), and warm sand ivory typography and branding (`#E1D2C0`).
- **Zero-Flash Persistence:** Uses an inline hydration script and `localStorage` to ensure your theme choice never flickers on page reloads.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with CSS custom properties for dual-theme switching
- **Real-Time Synchronization:** [Supabase Realtime](https://supabase.com/docs/guides/realtime) (WebSockets broadcast channel & presence tracking)
- **File & Media Storage:** [Supabase Storage](https://supabase.com/docs/guides/storage) (`clipboard-uploads` bucket)
- **Icons:** [Lucide React](https://lucide.dev/)
- **QR Code Generation:** [qrcode.react](https://www.npmjs.com/package/qrcode.react)

---

## 💻 Local Development Setup

To run SYNK locally on your machine:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.17.0 or higher recommended)
- `npm` or `pnpm` or `yarn`
- A free [Supabase](https://supabase.com/) project

### 2. Clone the Repository
```bash
git clone https://github.com/devshub37/paste-lab-extended_01.git
cd paste-lab-extended_01
```

### 3. Install Dependencies
```bash
npm run install:all
```
*(or run `cd frontend && npm install`)*

### 4. Configure Environment Variables
Create a `.env.local` file inside the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_GITHUB_REPO_URL=https://github.com/devshub37/paste-lab-extended_01
```

### 5. Configure Supabase Storage Bucket
In your Supabase project dashboard, run the SQL script found in [`supabase_storage_setup.sql`](supabase_storage_setup.sql) inside the Supabase **SQL Editor**:

```sql
-- Create public storage bucket for clipboard files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('clipboard-uploads', 'clipboard-uploads', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

-- Allow public uploads
CREATE POLICY "Allow public uploads to clipboard-uploads"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'clipboard-uploads');

-- Allow public downloads
CREATE POLICY "Allow public downloads from clipboard-uploads"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'clipboard-uploads');
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Production Build
```bash
npm run build
npm run start
```

---

## 🔒 Privacy & Data Handling

- **Session Scoping:** All shared clipboard items and files are strictly isolated to their randomly generated 8-digit session ID.
- **No User Profiling:** SYNK requires no accounts, email addresses, phone numbers, or analytics tracking cookies.
- **Self-Cleaning Sessions:** Content is meant for transient peer-to-peer transfers. When you are done sharing, simply close your session.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
Feel free to fork, customize, and contribute!
