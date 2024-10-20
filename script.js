document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('downloadForm');
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  const downloadMp4Btn = document.getElementById('downloadMp4');
  const downloadMp3Btn = document.getElementById('downloadMp3');

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

  function getVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async function fetchVideoInfo(videoId) {
    const response = await fetch(`https://youtube-v31.p.rapidapi.com/videos?part=contentDetails%2Csnippet%2Cstatistics&id=${videoId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'youtube-v31.p.rapidapi.com',
        'x-rapidapi-key': 'd1c53133acmsh2e7c470c0bfbb2ep1a074cjsne9dd522da151'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch video information');
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0];
    } else {
      throw new Error('No video information found');
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
