import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import InstagramProjectPage from './pages/InstagramProjectPage.jsx';
import NeuroscienceProjectPage from './pages/NeuroscienceProjectPage.jsx';
import ResumeLayout from './pages/ResumeLayout.jsx';
import ResumePage from './pages/ResumePage.jsx';
import SelectedProjectsPage from './pages/SelectedProjectsPage.jsx';

function App() {
  const location = useLocation();
  const normalizedPathname = location.pathname.replace(/\/+$/, '') || '/';
  const isResumeRoute = normalizedPathname === '/resume';

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={null} />
        <Route path="/projects" element={<SelectedProjectsPage />} />
        <Route
          path="/projects/instagram-automation"
          element={<InstagramProjectPage />}
        />
        <Route
          path="/projects/neuroscience-research"
          element={<NeuroscienceProjectPage />}
        />
        <Route path="*" element={<HomePage />} />
      </Routes>

      <ResumeLayout isVisible={isResumeRoute}>
        <ResumePage />
      </ResumeLayout>
    </>
  );
}

export default App;
