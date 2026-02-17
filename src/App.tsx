import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import History from './pages/History';
import KnowledgeBase from './pages/KnowledgeBase';
import Settings from './pages/Settings';
// PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// import PipelineEvaluations from './pages/PipelineEvaluations';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import UserGuide from './pages/UserGuide';
import Support from './pages/Support';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          {/* Public legal routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/support" element={<Support />} />
          {/* Protected application routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <ProtectedRoute>
                <KnowledgeBase />
              </ProtectedRoute>
            }
          />
          {/* PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE */}
          {/* <Route
            path="/pipeline-evaluations"
            element={
              <ProtectedRoute>
                <PipelineEvaluations />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
