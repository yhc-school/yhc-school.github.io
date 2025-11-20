class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">出错了</h1>
            <p className="text-gray-600 mb-4">抱歉，发生了意外错误。</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg">
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  try {
    const [username, setUsername] = React.useState('');
    const [studentId, setStudentId] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [alert, setAlert] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const handleLogin = async () => {
      if (!username || !studentId || !password) {
        setAlert({ type: 'error', message: '请填写所有字段' });
        return;
      }

      if (studentId.length !== 4) {
        setAlert({ type: 'error', message: '学号必须为四位' });
        return;
      }

      setLoading(true);

      try {
        // Check if admin
        if (username === 'admin' && studentId === '0000' && password === 'adminstrator') {
          localStorage.setItem('currentUser', JSON.stringify({ username, studentId, isAdmin: true }));
          window.location.href = 'admin.html';
          return;
        }

        // Check if user exists
        const users = await trickleListObjects('user', 1000, true);
        const existingUser = users.items.find(u => 
          u.objectData.username === username && u.objectData.studentId === studentId
        );

        if (existingUser) {
          // Verify password
          if (existingUser.objectData.password === password) {
            localStorage.setItem('currentUser', JSON.stringify({ 
              userId: existingUser.objectId,
              username, 
              studentId, 
              isAdmin: false 
            }));
            window.location.href = 'home.html';
          } else {
            setAlert({ type: 'error', message: '密码错误' });
          }
        } else {
          // Create new user
          const newUser = await trickleCreateObject('user', { username, studentId, password });
          localStorage.setItem('currentUser', JSON.stringify({ 
            userId: newUser.objectId,
            username, 
            studentId, 
            isAdmin: false 
          }));
          setAlert({ type: 'success', message: '账户创建成功，正在跳转...' });
          setTimeout(() => {
            window.location.href = 'home.html';
          }, 1000);
        }
      } catch (error) {
        setAlert({ type: 'error', message: '登录失败，请重试' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" data-name="app" data-file="app.js">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="icon-video text-3xl text-[var(--primary-color)]"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">视频管理系统</h1>
            <p className="text-gray-600 mt-2">请登录您的账户</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">学号（四位）</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                maxLength="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                placeholder="请输入四位学号"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                placeholder="请输入密码"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[var(--primary-color)] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            没有账户？登录时将自动创建
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);