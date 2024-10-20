document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('downloadForm');
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  const downloadMp4Btn = document.getElementById('downloadMp4');
  const downloadMp3Btn = document.getElementById('downloadMp3');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = getVideoId(videoUrl);

    if (!videoId) {
      showError('Invalid YouTube URL');
      return;
    }

    try {
      const videoInfo = await fetchVideoInfo(videoId);
      displayVideoInfo(videoInfo, videoId);
    } catch (error) {
      showError('Error fetching video information');
    }
  });

  downloadMp4Btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = getVideoId(videoUrl);
    startDownload(videoId, 'mp4');
  });

  downloadMp3Btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = getVideoId(videoUrl);
    startDownload(videoId, 'mp3');
  });

  async function startDownload(videoId, format) {
    try {
      progressBar.style.width = '0%';
      document.getElementById('downloadProgress').classList.remove('hidden');
      progressText.textContent = 'Starting download...';

      const response = await fetch(`/download?videoId=${videoId}&format=${format}`);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Download failed');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      progressBar.style.width = '100%';
      progressText.textContent = 'Download complete';
      
      setTimeout(() => {
        document.getElementById('downloadProgress').classList.add('hidden');
        progressText.textContent = '';
      }, 3000);
    } catch (error) {
      document.getElementById('downloadProgress').classList.add('hidden');
      showError(error.message);
    }
  }

  function getVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async function fetchVideoInfo(videoId) {
    try {
      const response = await fetch(`https://youtube-v31.p.rapidapi.com/videos?part=contentDetails%2Csnippet%2Cstatistics&id=${videoId}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'youtube-v31.p.rapidapi.com',
          'x-rapidapi-key': 'your-api-key'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch video information');
      
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0];
      }
      throw new Error('No video information found');
    } catch (error) {
      throw new Error('Error fetching video information');
    }
  }

  function displayVideoInfo(videoInfo, videoId) {
    document.getElementById('videoTitle').textContent = videoInfo.snippet.title;
    document.getElementById('videoThumbnail').src = videoInfo.snippet.thumbnails.high.url;
    document.getElementById('viewCount').textContent = videoInfo.statistics.viewCount;
    document.getElementById('likeCount').textContent = videoInfo.statistics.likeCount;
    document.getElementById('videoDescription').textContent = videoInfo.snippet.description;

    downloadMp4Btn.href = `/download?videoId=${videoId}&format=mp4`;
    downloadMp3Btn.href = `/download?videoId=${videoId}&format=mp3`;

    resultDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
  }
});
