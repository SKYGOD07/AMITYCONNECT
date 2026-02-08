# 🎓 AmityConnect - Smart Campus Safety & Mobility Logic

![AmityConnect Banner](public/logo.png)

**AmityConnect** is a hyper-local, community-driven platform designed to enhance safety and mobility within **Amity University Madhya Pradesh**. It integrates real-time emergency response systems with ride-sharing and peer-to-peer errand services, all wrapped in a gamified experience to encourage community participation.

## 🚀 Key Features

### 🚨 Emergency SOS System (Safety First)
A robust, real-time emergency alert system connecting students with faculty and security.
*   **Live Location Tracking**: Instantly shares live coordinates with the community.
*   **Faculty Response Overlay**: Verified faculty members receive a full-screen, flashing emergency overlay with sound alerts.
*   **Proximity Verification**: Faculty must be within **500m** of the incident to "Resolve" the alert, ensuring physical presence.
*   **"I'm Safe" Feature**: Students can resolve their own alerts if the situation is de-escalated.
*   **Anti-Spam Mechanism**: Verified responders can flag false alarms, which auto-hides spam alerts after multiple reports.

### 🚗 Ride Sharing (Campus Carpool)
Connects students/staff for shared commutes.
*   **Find & Offer Rides**: Post ride requests or offer empty seats.
*   **Smart Matching**: Matches routes based on origin/destination.

### 🛒 Errands Marketplace
Peer-to-peer help for campus tasks.
*   **Request Help**: Post errands (e.g., "Pick up my laundry").
*   **Earn Rewards**: Helpers earn badges and community points.

### 🏆 Gamification & Badges
Encourages positive community behavior.
*   **Streaks**: Daily activity tracking.
*   **Badges**: Earn unique badges like "Guardian" (SOS Responder), "Carpool Captain" (Rides shared), and "All-Rounder".
*   **Profile Stats**: Track your impact on the campus community.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Database**: Firebase Firestore (Real-time updates)
*   **Authentication**: Firebase Auth (Google Sign-In)
*   **Maps**: Leaflet / React-Leaflet (Google Maps Tiles)
*   **Styling**: Tailwind CSS + Shadcn/UI
*   **Notifications**: Sonner (Toast notifications)
*   **Icons**: Lucide React

---

## 🏃‍♂️ Getting Started

### Prerequisites
*   Node.js 18+
*   Firebase Project (with Firestore & Auth enabled)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SKYGOD07/AMITYCONNECT.git
    cd amity-connect
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

> Built with ❤️ for Amity University Madhya Pradesh.
