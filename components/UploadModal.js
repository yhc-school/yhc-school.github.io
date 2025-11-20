function UploadModal({ onClose, onUpload }) {
  try {
    const [title, setTitle] = React.useState('');
    const [videoFile, setVideoFile] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('video/')) {
          alert('请选择视频文件');
          return;
        }
        setVideoFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };

    const handleSubmit = async () => {
      if (!title || !videoFile) {
        alert('请填写标题并选择视频文件');
        return;
      }
      setLoading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', videoFile);
      
      try {
        const response = await fetch('https://file.trickle.so/upload', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          await onUpload(title, data.url);
          setLoading(false);
        } else {
          alert('上传失败，请重试');
          setLoading(false);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('上传失败，请检查网络连接后重试');
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-name="upload-modal" data-file="components/UploadModal.js">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">上传视频</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <div className="icon-x text-2xl"></div>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">视频标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                placeholder="请输入视频标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择视频文件</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--primary-color)] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  {videoFile ? (
                    <div>
                      <div className="icon-check-circle text-4xl text-green-500 mx-auto mb-2"></div>
                      <p className="text-gray-900 font-medium">{videoFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="icon-upload text-4xl text-gray-400 mx-auto mb-2"></div>
                      <p className="text-gray-600">点击选择视频文件</p>
                      <p className="text-sm text-gray-400 mt-1">支持所有常见视频格式</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
                <p className="text-gray-600 mt-2">正在上传...</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[var(--primary-color)] text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '上传中...' : '确认上传'}
            </button>
          </div>
        </div>
      </div>
    );
    // 在UploadModal.js中改进错误处理
const handleSubmit = async () => {
  if (!title || !videoFile) {
    alert('请填写标题并选择视频文件');
    return;
  }
  
  setLoading(true);
  setUploadProgress(0);
  
  const formData = new FormData();
  formData.append('file', videoFile);
  
  try {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progress);
      }
    });
    
    xhr.addEventListener('load', async () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.url) {
            await onUpload(title, response.url);
          } else {
            throw new Error('服务器返回数据格式错误');
          }
        } catch (parseError) {
          console.error('解析响应数据失败:', parseError);
          alert('服务器响应异常，请重试');
          setLoading(false);
        }
      } else {
        console.error('上传失败，状态码:', xhr.status);
        alert(`上传失败，服务器返回状态码: ${xhr.status}`);
        setLoading(false);
      }
    });
    
    xhr.addEventListener('error', () => {
      console.error('网络请求失败');
      alert('网络连接失败，请检查网络后重试');
      setLoading(false);
    });
    
    xhr.addEventListener('timeout', () => {
      console.error('请求超时');
      alert('上传超时，请重试');
      setLoading(false);
    });
    
    // 设置超时时间（30秒）
    xhr.timeout = 30000;
    xhr.open('POST', 'https://file.trickle.so/upload');
    xhr.send(formData);
    
  } catch (error) {
    console.error('上传过程发生错误:', error);
    alert('上传失败，请重试');
    setLoading(false);
  }
};
  } catch (error) {
    console.error('UploadModal component error:', error);
    return null;
  }
}
