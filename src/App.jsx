import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ResumeLayout, {
  ResumePageSkeleton,
} from './pages/ResumeLayout.jsx';
import SelectedProjectsPage from './pages/SelectedProjectsPage.jsx';
import { loadResumePage } from './routes.js';

const ResumePage = lazy(loadResumePage);

function App() {
  const location = useLocation();
  const normalizedPathname = location.pathname.replace(/\/+$/, '') || '/';
  const isResumeRoute = normalizedPathname === '/resume';
  const [hasMountedResume, setHasMountedResume] = useState(isResumeRoute);

  useEffect(() => {
    if (isResumeRoute) {
      setHasMountedResume(true);
    }
  }, [isResumeRoute]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={null} />
        <Route path="/projects" element={<SelectedProjectsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>

      {hasMountedResume || isResumeRoute ? (
        <ResumeLayout isVisible={isResumeRoute}>
          <Suspense fallback={<ResumePageSkeleton />}>
            <ResumePage />
          </Suspense>
        </ResumeLayout>
      ) : null}
    </>
  );
}

export default App;
