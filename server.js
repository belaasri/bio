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
    try {
        const { videoId, format } = req.query;

        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Verify video exists and is available
        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');

        if (format === 'mp4') {
            // Get highest quality format
            const format = ytdl.chooseFormat(videoInfo.formats, { quality: 'highest' });
            
            res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
            res.header('Content-Type', 'video/mp4');

            const stream = ytdl(videoUrl, {
                format: format,
                quality: 'highest'
            });

            // Handle stream errors
            stream.on('error', (error) => {
                console.error('Stream error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Download failed: ' + error.message });
                }
            });

            // Handle progress
            let downloadedBytes = 0;
            stream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                // You could emit progress here if needed
            });

            // Pipe the stream to response
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
                .on('error', (error) => {
                    console.error('FFmpeg error:', error);
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Conversion failed: ' + error.message });
                    }
                })
                .on('progress', (progress) => {
                    // You could emit progress here if needed
                })
                .pipe(res);

        } else {
            res.status(400).json({ error: 'Invalid format specified' });
        }

    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Download failed: ' + (error.message || 'Unknown error'),
                details: error.stack
            });
        }
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Server error: ' + error.message,
        details: error.stack
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Downloads directory: ${downloadsDir}`);
});
