Call Analytics Dashboard

This project is the frontend component of a Fullstack Engineer Assessment. It is a modern, responsive web application built with React and TypeScript designed to visualize voice agent call analytics. The styling and theme are inspired by the aesthetic of superbryn.com, focusing on a dark, professional, and visually engaging dashboard layout.

Key Features Implemented

The application successfully meets the core requirements of the assessment:

Dashboard Visualization: Displays key metrics using imaginary data across three primary charts:

Call Duration Analysis (Line Chart)

Sad Path Analysis (Bar Chart)

Customer Hostility Level (Pie Chart)

Custom Data Persistence Flow (Requirement 2, 3, 4): A full user flow is implemented for customizing the Call Duration Analysis chart, demonstrating both data persistence and overwriting safeguards.

Customization: Users can overwrite the dummy values for the Call Duration chart.

Authentication & Data Check: Before editing, the user is prompted for their email. The application attempts to retrieve any previously saved data using Firebase Firestore (or a Dummy Mode fallback if credentials are invalid).

Overwrite Confirmation: If existing data is found for the provided email, the user is shown their previous values and asked for confirmation before the new values are saved and applied.

Technologies Used

Frontend Framework: React (with functional components and Hooks)

Language: TypeScript

Styling: Tailwind CSS (loaded via CDN for single-file deployment)

Charting Library: Recharts

State Management: React's built-in useState and useCallback/useMemo

Database Service: Firebase Firestore (for user authentication and custom data persistence)

Project Structure

The project is logically divided into three main components:

File

Description

frontend/src/App.tsx

The main application component. Handles state management, Firebase initialization status, modal logic, and chart rendering.

frontend/src/components/ChartCard.tsx

A reusable wrapper component for charts. Handles title display and conditional rendering of the "Customize" button.

frontend/src/components/Modal.tsx

A reusable component for displaying pop-up forms, used here for the email and data entry flow.

frontend/src/services/firebaseService.ts

Abstracted service layer for all Firebase/Firestore interactions, including authentication and CRUD operations. Includes a Dummy Mode fallback to ensure the app runs even without valid API keys.

frontend/src/data/chartData.ts

Holds the dummy data and types used for the initial state of the charts.

Running the Application

This application is designed to run in an environment that injects Firebase configuration variables.

Prerequisites

You need a modern web browser that supports JavaScript and React.

Local Setup (Simulated)

Due to the reliance on global environment variables (__app_id, __firebase_config, __initial_auth_token), the application includes a Dummy Mode fallback in firebaseService.ts.

Initialization: The app attempts to initialize Firebase. If the injected configuration is missing or invalid, it gracefully falls back to a dummy setup.

Functionality: In Dummy Mode, the app will function fully on the UI level (the button will enable, the modal will open, and data changes will reflect), but the data saving/loading operations will be logged to the console and ignored, preventing API key errors.

Testing Customization

Click the Customize button on the "Call Duration Analysis" chart.

Enter any email (e.g., test@example.com) and click Next.

Modify the values in the input fields and click Save & Apply Data. The chart will update immediately.

Re-open the modal and enter the same email. The application will trigger the Confirm Overwrite state (in a live environment, it would show your previous data, but in Dummy Mode, it simulates the flow and shows your current draft).