import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import FileUploadPage from './components/FileUploadPage';
import ChatPage from './components/ChatPage';
import URLUploadPage from './components/URLUploadPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<FileUploadPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/upload-url" element={<URLUploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;


