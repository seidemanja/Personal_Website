import { useEffect, useLayoutEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AiChatPage from './pages/AiChatPage.jsx';
import DeloitteProductManagementPage from './pages/DeloitteProductManagementPage.jsx';
import HomePage from './pages/HomePage.jsx';
import InstagramProjectPage from './pages/InstagramProjectPage.jsx';
import NeuroscienceProjectPage from './pages/NeuroscienceProjectPage.jsx';
import PersonalWebsiteProjectPage from './pages/PersonalWebsiteProjectPage.jsx';
import ResumeLayout from './pages/ResumeLayout.jsx';
import ResumePage from './pages/ResumePage.jsx';
import SelectedProjectsPage from './pages/SelectedProjectsPage.jsx';
import TwitterProjectPage from './pages/TwitterProjectPage.jsx';

const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

function App() {
  const location = useLocation();
  const normalizedPathname = location.pathname.replace(/\/+$/, '') || '/';
  const isResumeRoute = normalizedPathname === '/resume';
  const isProjectsRoute = normalizedPathname === '/projects';

  useBrowserLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [normalizedPathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ai-chat" element={<AiChatPage />} />
        <Route path="/resume" element={null} />
        <Route path="/projects" element={null} />
        <Route
          path="/projects/instagram-automation"
          element={<InstagramProjectPage />}
        />
        <Route
          path="/projects/product-management-data-ai"
          element={<DeloitteProductManagementPage />}
        />
        <Route
          path="/projects/neuroscience-research"
          element={<NeuroscienceProjectPage />}
        />
        <Route
          path="/projects/personal-website-ai-assistant"
          element={<PersonalWebsiteProjectPage />}
        />
        <Route
          path="/projects/twitter-automation"
          element={<TwitterProjectPage />}
        />
        <Route path="*" element={<HomePage />} />
      </Routes>

      <ResumeLayout isVisible={isResumeRoute}>
        <ResumePage />
      </ResumeLayout>

      <div
        hidden={!isProjectsRoute}
        aria-hidden={!isProjectsRoute}
        style={isProjectsRoute ? undefined : { display: 'none' }}
      >
        <SelectedProjectsPage />
      </div>
    </>
  );
}

export default App;
