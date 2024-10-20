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
