# React Automotive Digital Cockpit

A sleek and modern digital dashboard for vehicles, built with **React**, **Tailwind CSS**, and **Socket.IO**. This project serves as a frontend interface for an automotive digital cockpit system, displaying real-time data in a clean, responsive, and component-based layout.

---

## ✨ Features

* **Component-Based Architecture**: The UI is broken down into reusable React components for `Navigation`, `VehicleInfo`, `MediaPlayer`, `ClimateControl`, and `ThemeToggle`.
* **Real-Time Data**: Uses **Socket.IO** to establish a persistent connection with a backend server, allowing for live updates of vehicle status.
* **Responsive Design**: Employs **Tailwind CSS** for a responsive 2x2 grid layout that adapts cleanly to different screen sizes.
* **Modern Styling**: Features a dark, futuristic theme with custom CSS for glass-panel effects, smooth transitions, and hover animations.
* **Theming**: Includes a theme toggle component, allowing for potential light/dark mode switching.

---

## 📋 Requirements

### Software
* **Node.js**: Version 18.x or newer is recommended.
* **Package Manager**: `npm` or `yarn`.
* **Backend Server**: A running instance of the corresponding backend that provides the Socket.IO connection.
* **Modern Web Browser**: Chrome, Firefox, Safari, or Edge.

### Knowledge
* **React**: A solid understanding of React hooks (`useState`, `useEffect`) and component structure.
* **JavaScript (ES6+)**: Familiarity with modern JavaScript syntax.
* **Tailwind CSS**: Basic knowledge of Tailwind's utility-first classes.
* **Socket.IO**: A basic understanding of how Socket.IO works for client-server communication.

---

## 🛠️ Tech Stack

* **Frontend**: [React](https://reactjs.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Real-Time Communication**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
* **Package Manager**: npm or yarn
* **Build Tool**: Vite or Create React App

---

## 🚀 Getting Started

Follow these steps to get a local copy of the frontend up and running.

### Prerequisites

Make sure you have met the requirements listed above.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git)
    cd YOUR_REPOSITORY_NAME
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```
    *or if you use yarn:*
    ```sh
    yarn install
    ```

3.  **Configure the backend connection:**
    In `src/socket.js`, ensure the `URL` points to your running backend server.

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:5173` (or another port as specified by your setup).

---

## 📁 Project Structure


. ├── public/ │ └── index.html ├── src/ │ ├── components/ │ │ ├── Navigation.jsx │ │ ├── VehicleInfo.jsx │ │ ├── MediaPlayer.jsx │ │ ├── ClimateControl.jsx │ │ └── ThemeToggle.jsx │ ├── App.jsx # Main application component and layout │ ├── index.css # Tailwind CSS directives and custom styles │ ├── main.jsx # Entry point for the React application │ └── socket.js # Socket.IO connection setup ├── package.json └── tailwind.config.js


---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page for this repository.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.




