const express = require('express')
const app = express()
const port = 3000;

app.get('/', (req, res) => {
    res.send('Node.js Task')
})

app.listen(port, () => console.log(`app listening port ${port}`));