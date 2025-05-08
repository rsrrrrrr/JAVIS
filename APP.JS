// src/App.js - 메인 애플리케이션 컴포넌트
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ZAVISHomepage from './components/ZAVISHomepage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatInterface from './pages/ChatInterface';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ZAVISHomepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <ChatInterface />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

// src/contexts/AuthContext.js - 인증 컨텍스트 구현
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 저장된 토큰으로 사용자 정보 불러오기
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const res = await api.get('/auth/user');
          setUser(res.data.user);
        } catch (err) {
          // 토큰이 유효하지 않으면 로그아웃
          localStorage.removeItem('token');
          setUser(null);
          setError('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // 로그인 함수
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || '로그인 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 회원가입 함수
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || '회원가입 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default Dashboard;

// src/components/DashboardLayout.js - 대시보드 레이아웃
import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Logo from './Logo';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: '📊' },
    { name: 'AI 채팅', href: '/chat', icon: '💬' },
    { name: '프로필', href: '/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 모바일 사이드바 */}
      <div className={`fixed inset-0 flex z-40 md:hidden transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">사이드바 닫기</span>
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Logo />
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-300">{passwordSuccess}</p>
              </div>
            )}
            
            {passwordError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{passwordError}</p>
              </div>
            )}
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  현재 비밀번호
                </label>
                <div className="mt-1">
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  새 비밀번호
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  새 비밀번호 확인
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading.password}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading.password ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      변경 중...
                    </span>
                  ) : (
                    '비밀번호 변경'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* API 키 설정 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">API 키 설정</h2>
            
            {apiKeysSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4">
                <p className="text-sm text-green-700 dark:text-green-300">{apiKeysSuccess}</p>
              </div>
            )}
            
            {apiKeysError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{apiKeysError}</p>
              </div>
            )}
            
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                API 키는 서버에서 안전하게 암호화되어 저장됩니다. 키를 입력하지 않으면 서버에 구성된 기본 API 키가 사용됩니다.
              </p>
            </div>
            
            <form onSubmit={handleApiKeysSave} className="space-y-4">
              <div>
                <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  OpenAI API 키
                </label>
                <div className="mt-1">
                  <input
                    id="openaiKey"
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="claudeKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Claude API 키
                </label>
                <div className="mt-1">
                  <input
                    id="claudeKey"
                    type="password"
                    value={claudeKey}
                    onChange={(e) => setClaudeKey(e.target.value)}
                    placeholder="sk-ant-api..."
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading.apiKeys}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading.apiKeys ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      저장 중...
                    </span>
                  ) : (
                    'API 키 저장'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

// src/pages/NotFound.js - 404 페이지
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h2 className="text-6xl font-extrabold text-blue-600">404</h2>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">페이지를 찾을 수 없습니다</h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

// src/components/Logo.js - 로고 컴포넌트
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center">
      <div className="text-2xl font-bold bg-blue-600 text-white px-2 py-1 rounded">
        ZAVIS
      </div>
      <div className="text-xl font-bold ml-1 dark:text-white">
        Engine
      </div>
    </div>
  );
};

export default Logo;

// 서버 측 코드 (.env 파일)
/*
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zavis-engine
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=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
CLAUDE_API_KEY=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
NODE_ENV=production
FRONTEND_URL=https://zavis-engine.com
*/

// server.js에 추가할 API 키 관리 엔드포인트
/*
// /backend/routes/auth.js에 추가 - API 키 관리 엔드포인트
router.put('/api-keys', authenticateUser, asyncHandler(async (req, res) => {
  const { openaiKey, claudeKey } = req.body;
  
  // 사용자 API 키 설정 업데이트
  const user = await User.findById(req.user._id);
  
  // 키가 제공된 경우에만 업데이트
  if (openaiKey) {
    // 실제 환경에서는 키를 암호화하여 저장해야 함
    user.openaiKey = encrypt(openaiKey);
  }
  
  if (claudeKey) {
    // 실제 환경에서는 키를 암호화하여 저장해야 함
    user.claudeKey = encrypt(claudeKey);
  }
  
  await user.save();
  
  res.json({ message: 'API 키가 성공적으로 업데이트되었습니다.' });
}));

// 프로필 업데이트 엔드포인트
router.put('/profile', authenticateUser, asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  // 사용자 정보 업데이트
  const user = await User.findById(req.user._id);
  user.name = name;
  await user.save();
  
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
}));
*/

// services/aiService.js에 수정할 부분
/*
// /backend/services/aiService.js 수정 - 사용자별 API 키 지원

// API 키 가져오기 (사용자 커스텀 키 또는 기본 키)
const getApiKey = async (userId, provider) => {
  // 사용자 조회
  const user = await User.findById(userId);
  
  // 사용자가 해당 서비스의 API 키를 설정했는지 확인
  if (provider === 'openai' && user.openaiKey) {
    // 암호화된 키 복호화
    return decrypt(user.openaiKey);
  } else if (provider === 'claude' && user.claudeKey) {
    return decrypt(user.claudeKey);
  }
  
  // 사용자별 키가 없으면 기본 환경 변수 키 사용
  return {
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.CLAUDE_API_KEY
  }[provider];
};

// OpenAI API 호출 (사용자별 키 지원)
const callOpenAI = async (prompt, model = 'gpt-4o', userId) => {
  try {
    const apiKey = await getApiKey(userId, 'openai');
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    return {
      text: response.data.choices[0].message.content,
      model: response.data.model,
      usage: response.data.usage
    };
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error.response?.data || error.message);
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.error?.message || 'OpenAI API 호출 중 오류가 발생했습니다.'
    };
  }
};

// Claude API 호출 (사용자별 키 지원)
const callClaude = async (prompt, model = 'claude-3-5-sonnet-20240620', userId) => {
  try {
    const apiKey = await getApiKey(userId, 'claude');
    
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
    
    return {
      text: response.data.content[0].text,
      model: response.data.model,
      usage: {
        input_tokens: response.data.usage?.input_tokens,
        output_tokens: response.data.usage?.output_tokens
      }
    };
  } catch (error) {
    console.error('Claude API 호출 오류:', error.response?.data || error.message);
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.error?.message || 'Claude API 호출 중 오류가 발생했습니다.'
    };
  }
};
*/

// MongoDB 스키마 수정 - API 키 필드 추가
/*
// /backend/models/user.js 수정 - API 키 필드 추가
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  openaiKey: {
    type: String,
    default: null
  },
  claudeKey: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
*/="text-base font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true">
          {/* 포스 사이드바 클릭 영역을 닫기 위한 공백 */}
        </div>
      </div>

      {/* 데스크톱 사이드바 */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 shadow">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Logo />
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3 flex-shrink-0 h-6 w-6 flex items-center justify-center">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white dark:bg-gray-900 shadow">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">사이드바 열기</span>
            <span className="text-2xl">☰</span>
          </button>
        </div>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

// src/pages/ChatInterface.js - AI 채팅 인터페이스
import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { callOpenAI, callClaude } from '../services/aiService';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! ZAVIS Engine에 오신 것을 환영합니다. GPT-4o와 Claude 3.5를 활용한 지능형 AI 어시스턴트입니다. 무엇을 도와드릴까요?',
      model: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  
  // 메시지 영역 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (input.trim() === '' || isProcessing) return;
    
    // 사용자 메시지 추가
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setError(null);
    
    try {
      let response;
      
      // 선택된 모델에 따라 API 호출
      if (selectedModel.startsWith('gpt')) {
        response = await callOpenAI(input, selectedModel);
      } else {
        response = await callClaude(input, selectedModel);
      }
      
      // AI 응답 추가
      const aiMessage = {
        role: 'assistant',
        content: response.text,
        model: response.model,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI 응답 오류:', err);
      setError(typeof err === 'string' ? err : '요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 shadow p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">AI 채팅</h1>
            <div className="flex items-center">
              <label htmlFor="modelSelect" className="mr-2 text-sm">모델:</label>
              <select
                id="modelSelect"
                value={selectedModel}
                onChange={handleModelChange}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isProcessing}
              >
                <optgroup label="OpenAI">
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </optgroup>
                <optgroup label="Anthropic">
                  <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>
        
        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 shadow rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.model && msg.role === 'assistant' && (
                    <div className="mt-2 text-xs opacity-75 flex justify-end">
                      {msg.model === 'system' ? 'ZAVIS Engine' : msg.model}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* 입력 영역 */}
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={isProcessing ? "AI가 응답을 생성 중입니다..." : "메시지를 입력하세요..."}
              disabled={isProcessing}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={isProcessing || input.trim() === ''}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isProcessing ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '전송'
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatInterface;

// src/pages/Profile.js - 프로필 관리 페이지
import React, { useState, useContext } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, setError: setAuthError } = useContext(AuthContext);
  
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [apiKeysSuccess, setApiKeysSuccess] = useState(null);
  
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [apiKeysError, setApiKeysError] = useState(null);
  
  const [isLoading, setIsLoading] = useState({
    profile: false,
    password: false,
    apiKeys: false
  });

  // 프로필 정보 업데이트
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsLoading(prev => ({ ...prev, profile: true }));
    
    try {
      await api.put('/auth/profile', { name });
      setProfileSuccess('프로필 정보가 성공적으로 업데이트되었습니다.');
    } catch (err) {
      setProfileError(err.response?.data?.error || '프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setIsLoading(prev => ({ ...prev, password: true }));
    
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.error || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  // API 키 저장
  const handleApiKeysSave = async (e) => {
    e.preventDefault();
    setApiKeysError(null);
    setApiKeysSuccess(null);
    setIsLoading(prev => ({ ...prev, apiKeys: true }));
    
    try {
      await api.put('/auth/api-keys', {
        openaiKey: openaiKey || undefined,
        claudeKey: claudeKey || undefined
      });
      setApiKeysSuccess('API 키가 성공적으로 저장되었습니다.');
      
      // 입력 필드 마스킹 처리
      setOpenaiKey(openaiKey ? '••••••••' : '');
      setClaudeKey(claudeKey ? '••••••••' : '');
    } catch (err) {
      setApiKeysError(err.response?.data?.error || 'API 키 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(prev => ({ ...prev, apiKeys: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">프로필 관리</h1>

        <div className="space-y-8">
          {/* 프로필 정보 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
            
            {profileSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4">
                <p className="text-sm text-green-700 dark:text-green-300">{profileSuccess}</p>
              </div>
            )}
            
            {profileError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">{profileError}</p>
              </div>
            )}
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  이메일 주소
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-500 dark:text-gray-400 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">이메일 주소는 변경할 수 없습니다.</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  이름
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading.profile}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading.profile ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      업데이트 중...
                    </span>
                  ) : (
                    '프로필 업데이트'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 비밀번호 변경 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">비밀번호 변경</h2>
            
            {passwordSuccess && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4">
                <p className

// src/services/api.js - API 서비스 구현
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 - 인증 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러 (인증 실패)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// src/services/aiService.js - AI 서비스 API 구현
import api from './api';

// OpenAI API 호출
export const callOpenAI = async (prompt, model = 'gpt-4o') => {
  try {
    const response = await api.post('/ai/openai', { prompt, model });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || '요청 처리 중 오류가 발생했습니다.';
  }
};

// Claude API 호출
export const callClaude = async (prompt, model = 'claude-3-5-sonnet-20240620') => {
  try {
    const response = await api.post('/ai/claude', { prompt, model });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || '요청 처리 중 오류가 발생했습니다.';
  }
};

// API 사용량 조회
export const getApiUsage = async () => {
  try {
    const response = await api.get('/ai/usage');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || '사용량 조회 중 오류가 발생했습니다.';
  }
};

// AI 서비스 상태 조회
export const getAiStatus = async () => {
  try {
    const response = await api.get('/ai/status');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || '서비스 상태 조회 중 오류가 발생했습니다.';
  }
};

// src/components/PrivateRoute.js - 인증된 사용자만 접근 가능한 라우트
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // 로딩 중에는 아무것도 렌더링하지 않음
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 로그인한 경우 자식 컴포넌트 렌더링
  return children;
};

export default PrivateRoute;

// src/pages/Login.js - 로그인 페이지
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <Logo />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          계정에 로그인
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          또는{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            새 계정 만들기
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일 주소
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  비밀번호를 잊으셨나요?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </span>
                ) : (
                  '로그인'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

// src/pages/Register.js - 회원가입 페이지
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const success = await register(name, email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <Logo />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          새 계정 만들기
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            로그인하기
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이름
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일 주소
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호 확인
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    가입 중...
                  </span>
                ) : (
                  '회원가입'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

// src/pages/Dashboard.js - 대시보드 페이지
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { getApiUsage, getAiStatus } from '../services/aiService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [usageData, setUsageData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usage, status] = await Promise.all([
          getApiUsage(),
          getAiStatus()
        ]);
        setUsageData(usage);
        setStatusData(status);
      } catch (err) {
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 사용량 데이터에서 일별 사용량 계산
  const calculateDailyUsage = (usage) => {
    if (!usage || !usage.usage || usage.usage.length === 0) {
      return [];
    }

    const dailyUsage = {};
    usage.usage.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!dailyUsage[date]) {
        dailyUsage[date] = {
          date,
          total: 0,
          openai: 0,
          claude: 0
        };
      }
      
      dailyUsage[date].total += 1;
      if (item.provider === 'openai') {
        dailyUsage[date].openai += 1;
      } else if (item.provider === 'claude') {
        dailyUsage[date].claude += 1;
      }
    });

    return Object.values(dailyUsage).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  };

  const dailyUsageData = calculateDailyUsage(usageData);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-gray-600 dark:text-gray-400">{user?.name}님, 환영합니다!</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        ) : (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">총 API 호출</h2>
                <p className="text-3xl font-bold text-blue-600">{usageData?.stats?.total || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">OpenAI 호출</h2>
                <p className="text-3xl font-bold text-green-600">{usageData?.stats?.byProvider?.openai || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">Claude 호출</h2>
                <p className="text-3xl font-bold text-purple-600">{usageData?.stats?.byProvider?.claude || 0}</p>
              </div>
            </div>

            {/* 서비스 상태 */}
            {statusData && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">서비스 상태</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${statusData.openai ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>OpenAI API: {statusData.openai ? '정상' : '장애'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${statusData.claude ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Claude API: {statusData.claude ? '정상' : '장애'}</span>
                  </div>
                </div>
                
                <h3 className="text-md font-medium mt-6 mb-2">사용 가능한 모델</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">OpenAI</h4>
                    <ul className="text-sm space-y-1">
                      {statusData.models?.openai?.map((model, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">{model}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Claude</h4>
                    <ul className="text-sm space-y-1">
                      {statusData.models?.claude?.map((model, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">{model}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 최근 일별 사용량 */}
            {dailyUsageData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">최근 일별 사용량</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">날짜</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">총 호출</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">OpenAI</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Claude</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {dailyUsageData.map((day, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{day.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{day.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{day.openai}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">{day.claude}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 바로가기 버튼 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/chat"
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg flex flex-col items-center justify-center shadow-md"
              >
                <span className="text-3xl mb-2">💬</span>
                <h3 className="text-lg font-medium">AI 채팅 시작하기</h3>
                <p className="text-sm text-center mt-1">GPT-4o와 Claude 3.5를 활용한 AI 대화를 시작하세요.</p>
              </Link>
              <Link
                to="/profile"
                className="bg-gray-700 hover:bg-gray-800 text-white p-6 rounded-lg flex flex-col items-center justify-center shadow-md"
              >
                <span className="text-3xl mb-2">⚙️</span>
                <h3 className="text-lg font-medium">프로필 설정</h3>
                <p className="text-sm text-center mt-1">API 키 설정 및 사용자 정보를 관리하세요.</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
