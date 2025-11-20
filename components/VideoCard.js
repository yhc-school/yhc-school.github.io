function VideoCard({ video }) {
  try {
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow" data-name="video-card" data-file="components/VideoCard.js">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <div className="icon-play-circle text-6xl text-gray-400"></div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {video.objectData.title}
          </h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <div className="icon-user text-base mr-2"></div>
            <span>{video.objectData.username}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <div className="icon-calendar text-base mr-2"></div>
            <span>{formatDate(video.objectData.uploadDate)}</span>
          </div>
          <a
            href={video.objectData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full text-center bg-[var(--secondary-color)] text-[var(--primary-color)] py-2 rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition-colors"
          >
            观看视频
          </a>
        </div>
      </div>
    );
  } catch (error) {
    console.error('VideoCard component error:', error);
    return null;
  }
}