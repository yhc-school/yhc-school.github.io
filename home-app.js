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

function HomeApp() {
  try {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [videos, setVideos] = React.useState([]);
    const [showUploadModal, setShowUploadModal] = React.useState(false);
    const [alert, setAlert] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) {
        window.location.href = 'index.html';
        return;
      }
      const user = JSON.parse(userStr);
      if (user.isAdmin) {
        window.location.href = 'admin.html';
        return;
      }
      setCurrentUser(user);
      loadVideos(user.userId);
    }, []);

    const loadVideos = async (userId) => {
      setLoading(true);
      try {
        const result = await trickleListObjects('video', 1000, true);
        const userVideos = result.items.filter(v => v.objectData.userId === userId);
        setVideos(userVideos);
      } catch (error) {
        setAlert({ type: 'error', message: '加载视频失败' });
      } finally {
        setLoading(false);
      }
    };

    const handleUpload = async (title, url) => {
      try {
        await trickleCreateObject('video', {
          userId: currentUser.userId,
          username: currentUser.username,
          studentId: currentUser.studentId,
          title,
          url,
          uploadDate: new Date().toISOString()
        });
        setAlert({ type: 'success', message: '视频上传成功' });
        loadVideos(currentUser.userId);
        setShowUploadModal(false);
      } catch (error) {
        setAlert({ type: 'error', message: '上传失败，请重试' });
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    };

    if (!currentUser) return null;

    return (
      <div className="min-h-screen bg-gray-50" data-name="home-app" data-file="home-app.js">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--secondary-color)] rounded-full flex items-center justify-center">
                <div className="icon-video text-xl text-[var(--primary-color)]"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">视频管理系统</h1>
                <p className="text-sm text-gray-600">{currentUser.username} ({currentUser.studentId})</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:opacity-90"
              >
                <div className="icon-upload text-lg"></div>
                <span>上传视频</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">我的视频</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">加载中...</div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="icon-video text-5xl text-gray-300 mx-auto mb-4"></div>
              <p className="text-gray-600">还没有上传视频</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 text-[var(--primary-color)] hover:underline"
              >
                立即上传
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(video => (
                <VideoCard key={video.objectId} video={video} />
              ))}
            </div>
          )}
        </div>

        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUpload}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('HomeApp component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <HomeApp />
  </ErrorBoundary>
);