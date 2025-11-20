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

function AdminApp() {
  try {
    const [users, setUsers] = React.useState([]);
    const [selectedUserId, setSelectedUserId] = React.useState(null);
    const [userVideos, setUserVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [alert, setAlert] = React.useState(null);

    React.useEffect(() => {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        window.location.href = 'index.html';
        return;
      }
      const user = JSON.parse(userStr);
      if (!user.isAdmin) {
        window.location.href = 'home.html';
        return;
      }
      loadUsers();
    }, []);

    const loadUsers = async () => {
      setLoading(true);
      try {
        const result = await trickleListObjects('user', 1000, true);
        const filteredUsers = result.items.filter(u => 
          !(u.objectData.username === 'admin' && u.objectData.studentId === '0000')
        );
        setUsers(filteredUsers);
        if (filteredUsers.length > 0) {
          setSelectedUserId(filteredUsers[0].objectId);
          loadUserVideos(filteredUsers[0].objectId);
        }
      } catch (error) {
        setAlert({ type: 'error', message: '加载用户失败' });
      } finally {
        setLoading(false);
      }
    };

    const loadUserVideos = async (userId) => {
      try {
        const result = await trickleListObjects('video', 1000, true);
        const videos = result.items.filter(v => v.objectData.userId === userId);
        setUserVideos(videos);
      } catch (error) {
        setAlert({ type: 'error', message: '加载视频失败' });
      }
    };

    const handleUserSelect = (userId) => {
      setSelectedUserId(userId);
      loadUserVideos(userId);
    };

    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    };

    const selectedUser = users.find(u => u.objectId === selectedUserId);

    return (
      <div className="min-h-screen bg-gray-50" data-name="admin-app" data-file="admin-app.js">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--secondary-color)] rounded-full flex items-center justify-center">
                <div className="icon-shield text-xl text-[var(--primary-color)]"></div>
              </div>
              <h1 className="text-xl font-bold text-gray-900">管理员后台</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300"
            >
              退出登录
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">用户列表</h2>
              {loading ? (
                <div className="text-center py-4 text-gray-600">加载中...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-4 text-gray-600">暂无用户</div>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <div
                      key={user.objectId}
                      onClick={() => handleUserSelect(user.objectId)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUserId === user.objectId
                          ? 'bg-[var(--secondary-color)] border-2 border-[var(--primary-color)]'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{user.objectData.username}</div>
                      <div className="text-sm text-gray-600">学号: {user.objectData.studentId}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              {selectedUser ? (
                <div>
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedUser.objectData.username} 的视频
                    </h2>
                    <p className="text-gray-600">学号: {selectedUser.objectData.studentId}</p>
                  </div>

                  {userVideos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                      <div className="icon-video text-5xl text-gray-300 mx-auto mb-4"></div>
                      <p className="text-gray-600">该用户还没有上传视频</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userVideos.map(video => (
                        <VideoCard key={video.objectId} video={video} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600">请选择一个用户查看视频</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AdminApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);