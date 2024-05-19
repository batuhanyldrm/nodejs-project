const express = require('express')
const userRoutes = require('./src/user/routes')
const bookRoutes = require('./src/book/routes')

const app = express()
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Node.js Task')
})

app.use('/users', userRoutes)
app.use('/books', bookRoutes)

app.listen(port, () => console.log(`app listening port ${port}`));
