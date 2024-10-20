const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/download', async (req, res) => {
  const { videoId, format } = req.query;

  if (!videoId) {
    return res.status(400).send('Video ID is required');
  }

  try {
    const videoInfo = await ytdl.getInfo(videoId);
    const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
    const outputPath = path.join(__dirname, 'downloads', `${videoTitle}.${format}`);

    if (format === 'mp4') {
      ytdl(videoId, { quality: 'highest' })
        .pipe(fs.createWriteStream(outputPath))
        .on('finish', () => {
          res.download(outputPath, `${videoTitle}.mp4`, (err) => {
            if (err) {
              console.error('Error sending file:', err);
            }
            fs.unlinkSync(outputPath);
          });
        });
    } else if (format === 'mp3') {
      ytdl(videoId, { quality: 'highestaudio' })
        .pipe(ffmpeg()
          .toFormat('mp3')
          .on('end', () => {
            res.download(outputPath, `${videoTitle}.mp3`, (err) => {
              if (err) {
                console.error('Error sending file:', err);
              }
              fs.unlinkSync(outputPath);
            });
          })
        )
        .save(outputPath);
    } else {
      res.status(400).send('Invalid format');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
