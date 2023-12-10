const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Set up static file serving for the project folder
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        console.error('Error sending file:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});