const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/download', async (req, res) => {
    try {
        const url = req.query.url;
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
        
        res.header('Content-Disposition', `attachment; filename="video.mp4"`);
        ytdl(url, { format: format }).pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during download');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
