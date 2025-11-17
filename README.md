# Document Chat with Gemini AI

A modern web application that allows users to upload documents and chat with an AI assistant powered by Google's Gemini. The application features a clean, responsive interface built with React and FastAPI.

## 🌟 Features

- 📄 Upload and process various document formats
- 💬 Chat with AI about your documents
- 🎨 Modern and responsive UI
- 🚀 Fast API backend with FastAPI
- 🔒 Secure API key management with environment variables

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- Google Gemini API key

### 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GG-FST
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure API Key**
   - Get your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)
   - Create a `.env` file in the `backend` directory
   - Add your API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

### 🏃 Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
GG-FST/
├── backend/               # FastAPI backend
│   ├── main.py           # Main application file
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Environment variables (create this file)
└── frontend/             # React frontend
    ├── src/              # Source files
    ├── public/           # Static files
    └── package.json      # Node.js dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini for the AI capabilities
- FastAPI for the backend framework
- React for the frontend framework