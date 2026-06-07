import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ResumeLayout from './pages/ResumeLayout.jsx';
import SelectedProjectsPage from './pages/SelectedProjectsPage.jsx';
import { loadResumePage } from './routes.js';

const ResumePage = lazy(loadResumePage);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/resume"
        element={
          <ResumeLayout>
            <Suspense fallback={null}>
              <ResumePage />
            </Suspense>
          </ResumeLayout>
        }
      />
      <Route path="/projects" element={<SelectedProjectsPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
