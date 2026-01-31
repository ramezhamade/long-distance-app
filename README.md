# Our Long Distance Love App

A beautiful web application designed for long-distance couples to track special dates and count down to your next meeting together.

## Features

- **Countdown Timer**: Live countdown to your next special event with days, hours, minutes, and seconds
- **Shared Calendar**: Add and manage all your important dates (anniversaries, visits, special occasions)
- **Event Management**: Create events with titles, dates, and descriptions
- **Memories**: Past events are automatically moved to a "Memories" section
- **Beautiful UI**: Romantic gradient design with a clean, modern interface

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Node.js with Express
- **Styling**: Custom CSS with gradient backgrounds
- **Data Storage**: JSON file-based storage

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your computer. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd long-distance-app
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You need to run both the backend and frontend servers.

1. **Start the backend server** (in the `backend` directory):
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000`

2. **In a new terminal, start the frontend** (in the `frontend` directory):
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser** and go to `http://localhost:3000`

## Using the App

1. **Add Your First Event**:
   - Click the "+ Add Event" button
   - Enter a title (e.g., "Our Anniversary", "Next Visit")
   - Select a date and time
   - Optionally add a description
   - Click "Add Event"

2. **View Your Countdown**:
   - The countdown timer at the top shows the time remaining until your next upcoming event
   - It updates in real-time every second

3. **Manage Events**:
   - View all upcoming events in the "Upcoming Events" section
   - Past events automatically move to the "Memories" section
   - Click the trash icon to delete an event

## Project Structure

```
long-distance-app/
├── backend/
│   ├── server.js          # Express server and API endpoints
│   ├── package.json       # Backend dependencies
│   └── data.json          # Event storage (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.jsx    # Calendar and event management
│   │   │   └── Countdown.jsx   # Countdown timer
│   │   ├── App.jsx        # Main application component
│   │   ├── App.css        # Application styles
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## Development

- **Backend Development**: The backend uses `nodemon` for auto-reloading. Run `npm run dev` instead of `npm start` in the backend directory.
- **Frontend Development**: Vite provides hot module replacement out of the box.

## Tips for Couples

- Set your anniversary as a recurring yearly event
- Add countdowns for planned visits
- Use descriptions to add sweet messages for each event
- Check the app together during video calls

## Future Enhancement Ideas

- User authentication for multiple couples
- Photo uploads for events
- Real-time chat feature
- Timezone support for different locations
- Mobile app version
- Reminders and notifications

---

Made with love for long-distance relationships
