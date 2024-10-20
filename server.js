const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

app.use(express.json());
app.use(express.static('public'));

app.get('/download', async (req, res) => {
    const { videoId, format } = req.query;

    if (!videoId) {
        return res.status(400).send('Video ID is required');
    }

    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
        const outputPath = path.join(downloadsDir, `${videoTitle}.${format}`);

        if (format === 'mp4') {
            const videoStream = ytdl(videoUrl, { 
                quality: 'highest',
                filter: 'videoandaudio'
            });

            res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
            res.header('Content-Type', 'video/mp4');

            videoStream.pipe(res);

            videoStream.on('error', (error) => {
                console.error('Stream error:', error);
                if (!res.headersSent) {
                    res.status(500).send('Download failed');
                }
            });

        } else if (format === 'mp3') {
            const audioStream = ytdl(videoUrl, { 
                quality: 'highestaudio',
                filter: 'audioonly'
            });

            res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp3"`);
            res.header('Content-Type', 'audio/mpeg');

            ffmpeg(audioStream)
                .toFormat('mp3')
                .on('error', (error) => {
                    console.error('FFmpeg error:', error);
                    if (!res.headersSent) {
                        res.status(500).send('Conversion failed');
                    }
                })
                .pipe(res);

        } else {
            res.status(400).send('Invalid format specified');
        }

    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).send('An error occurred');
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
