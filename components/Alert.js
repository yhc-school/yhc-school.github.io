function Alert({ type, message, onClose }) {
  try {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';

    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in" data-name="alert" data-file="components/Alert.js">
        <div className={`${bgColor} border-l-4 p-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]`}>
          <div className={`icon-${iconName} text-xl ${textColor}`}></div>
          <p className={`${textColor} font-medium flex-1`}>{message}</p>
          <button onClick={onClose} className={`${textColor} hover:opacity-70`}>
            <div className="icon-x text-lg"></div>
          </button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Alert component error:', error);
    return null;
  }
}