document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusElement = document.getElementById('status');

    downloadBtn.addEventListener('click', async () => {
        const url = videoUrlInput.value.trim();
        if (!url) {
            statusElement.textContent = 'Please enter a valid YouTube URL';
            return;
        }

        statusElement.textContent = 'Downloading...';
        try {
            const response = await fetch(`/download?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error('Download failed');
            }
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'video.mp4';
            document.body.appendChild(link);
            link.click();
            link.remove();
            statusElement.textContent = 'Download complete!';
        } catch (error) {
            statusElement.textContent = 'Failed to download video. Please check the URL and try again.';
        }
    });
});
