# EmoDetc - Emotional Detection Team's

EmoDetc is a web-based application designed to detect and manage emotions within digital project teams. The application helps teams track mood trends, facilitate discussions with emotional context, and improve team dynamics through emotional awareness.

## Architecture

EmoDetc follows a 3-layer architecture:

1. **Input Layer**: Handles user inputs including manual mood selection and facial expression detection
2. **Core Layer**: Processes and stores emotional data, manages application state
3. **Output Layer**: Visualizes emotional data through dashboards, reports, and team feeds

## Features

- **Cek Mood**: Simple form with color squares for mood tracking (Green=Happy, Yellow=Neutral, Red=Angry, Blue=Sad)
- **FaceTracker**: Camera integration for facial expression analysis, integrated into the Discussion page
- **Dashboard Emosi**: Charts and visualizations for mood trends with color legend
- **Diskusi Grup**: Chat room with mood indicators using color squares
- **Chat History**: Filterable chat history view
- **Weekly Report**: Weekly mood summary with charts
- **Feed Tim**: Team feedback system

## Technologies Used

- HTML5, CSS3, JavaScript
- TailwindCSS for styling
- Chart.js for data visualization
- Browser Camera API for facial detection

## Getting Started

1. Clone the repository
2. Open `index.html` in a web browser
3. Navigate through the application using the top navigation bar

## Pages

- **Home**: Dashboard overview with mood summaries and quick links
- **Mood Check**: Interface for selecting your current mood
- **Discussion**: Group chat with integrated face tracking for emotion detection
- **Dashboard**: Detailed mood analytics and team emotion trends
- **Weekly Report**: Comprehensive weekly summary of team emotions
- **Team Feed**: Platform for sharing reflections and insights

## Development

The application is structured with modular components:

```
EmoDetc/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── components/
│       ├── face-tracker.js
│       ├── discussion.js
│       ├── dashboard.js
│       ├── mood-check.js
│       ├── weekly-report.js
│       └── team-feed.js
├── index.html
├── mood-check.html
├── discussion.html
├── dashboard.html
├── weekly-report.html
└── team-feed.html
```

## Future Enhancements

- Backend integration for persistent data storage
- Real machine learning-based facial emotion detection
- Mobile application version
- Integration with project management tools
- Team building recommendations based on emotional patterns
