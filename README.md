# 📊 Call Analytics Dashboard

> A modern, responsive web application built with **React** and **TypeScript**, designed to visualize **voice agent call analytics**.  
> Inspired by [superbryn.com](https://superbryn.com), this project features a **dark, professional, and visually engaging** dashboard layout.

---

## 🚀 Overview

This project serves as the **frontend component** of a Fullstack Engineer Assessment.  
It demonstrates dynamic data visualization, data persistence, and customizable analytics dashboards.

---

## 🌟 Key Features

### 🧭 Dashboard Visualization
Displays key call metrics using **imaginary data** across three interactive charts:

- 📈 **Call Duration Analysis** – Line Chart  
- 📊 **Sad Path Analysis** – Bar Chart  
- 🥧 **Customer Hostility Level** – Pie Chart  

### 🔄 Custom Data Persistence Flow *(Requirements 2, 3, 4)*
Implements a complete flow for customizing and saving chart data with overwrite protection.

- ✏️ **Customization:** Users can modify dummy values in the *Call Duration Analysis* chart.  
- 🔐 **Authentication & Data Check:**  
  Prompts for an email, fetches previous data via **Firebase Firestore**, or falls back to **Dummy Mode** if credentials are invalid.  
- ⚠️ **Overwrite Confirmation:**  
  If existing data is found, users can review it before confirming overwrite.

---

## 🧰 Technologies Used

| Category | Technology |
|-----------|-------------|
| **Frontend Framework** | React (Functional Components + Hooks) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (via CDN for single-file deployment) |
| **Charts** | Recharts |
| **State Management** | React’s built-in `useState`, `useCallback`, and `useMemo` |
| **Database / Auth** | Firebase Firestore |
| **Fallback Mode** | Dummy Mode (for offline/demo use) |

---

## 🏗 Project Structure

| File | Description |
|------|--------------|
| `frontend/src/App.tsx` | Main application component. Manages state, Firebase initialization, modals, and charts. |
| `frontend/src/components/ChartCard.tsx` | Reusable chart wrapper with title and optional "Customize" button. |
| `frontend/src/components/Modal.tsx` | Generic modal component used for email/data entry. |
| `frontend/src/services/firebaseService.ts` | Abstraction layer for Firebase/Firestore CRUD operations and Dummy Mode. |
| `frontend/src/data/chartData.ts` | Contains dummy data and TypeScript types for chart initialization. |

---

## ⚙️ Running the Application

The app expects environment variables injected at runtime for Firebase configuration.

### 🧾 Prerequisites
- A modern web browser supporting JavaScript and React.

### 💻 Local Setup (Simulated)
Because Firebase credentials are injected via global variables  
(`__app_id`, `__firebase_config`, `__initial_auth_token`),  
the project includes a **Dummy Mode** to ensure it runs smoothly without real keys.

#### 🔍 How It Works
- **Initialization:** If Firebase fails to initialize, the app automatically switches to Dummy Mode.  
- **Functionality:** All UI flows (customize button, modals, inputs) remain active, but data persistence is simulated — operations are logged to the console.

---

## 🧪 Testing the Customization Flow

1. Click **Customize** on the “Call Duration Analysis” chart.  
2. Enter an email (e.g. `test@example.com`) and click **Next**.  
3. Modify the data fields and click **Save & Apply Data** — the chart updates instantly.  
4. Reopen the modal and enter the same email.  
   - In a live environment → previously saved data appears.  
   - In Dummy Mode → the flow simulates as if real data was fetched.

---

## 🧑‍💻 Developer Notes

- The project emphasizes **clean component design**, **state isolation**, and **graceful fallback handling**.  
- All services are abstracted to ensure **easy migration** to production-ready Firebase credentials.  
- Styling follows a **dark, elegant, and minimal dashboard aesthetic**.

---

## 📸 UI Preview

> *(Add screenshots here — e.g., dashboard layout, modal view, charts)*

---

## 🧾 License

This project is developed as part of a **Fullstack Engineer Assessment** and is provided for **demonstration purposes** only.

---

### ❤️ Built with passion using React + TypeScript
