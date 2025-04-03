import 'dotenv/config'
import express from "express"
const app = express()

const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/login', (req, res) => {
    res.send("<h1>Hari is here</h1>")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})