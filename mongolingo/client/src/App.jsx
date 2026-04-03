import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import QuizPage from './pages/QuizPage';
import CollectionsPage from './pages/CollectionsPage';
import DataPage from './pages/DataPage';
import ProgressPage from './pages/ProgressPage';
import LessonsPage from './pages/LessonsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<QuizPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
