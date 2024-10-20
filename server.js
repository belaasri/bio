const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// Download video route
app.get('/download', async (req, res) => {
    try {
        const { videoId, format } = req.query;

        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Fetch video info
        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');

        if (format === 'mp4') {
            res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
            res.header('Content-Type', 'video/mp4');

            const stream = ytdl(videoUrl, { quality: 'highest' });
            stream.pipe(res);

        } else if (format === 'mp3') {
            res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp3"`);
            res.header('Content-Type', 'audio/mpeg');

            const stream = ytdl(videoUrl, {
                quality: 'highestaudio',
                filter: 'audioonly'
            });

            ffmpeg(stream)
                .toFormat('mp3')
                .audioBitrate(128)
                .pipe(res);

        } else {
            res.status(400).json({ error: 'Invalid format specified' });
        }
    } catch (error) {
        res.status(500).json({ 
            error: 'Download failed: ' + error.message 
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
