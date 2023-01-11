import express, { Request, Response } from 'express'
import Sender from './sender'

const sender = new Sender()



const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.get('/status', (req: Request, res: Response) => {

    const connected = sender.isConnected

    if (!connected) {
        return res.send({
            qr_code: sender.qrCode,
            connected: sender.isConnected
        })
    }

    return res.send({
        connected: sender.isConnected
    })
})


app.post('/send', async (req: Request, res: Response) => {
    try {

        const { number, message } = req.body

        await sender.sendMessage(number, message)

        return res.status(200).json()
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: "error", message: error })
    }
})


app.post('/sendMultiple', async (req: Request, res: Response) => {
    try {
        const { numbers, message } = req.body

        const { listOfInvalidNumbers, not_sent_amount } = await sender.sendMultipleMessages(numbers, message)


        return res.status(200).json({ listOfInvalidNumbers, not_sent_amount })
    } catch (error) {
        console.error(error)
        res.status(500).json({ status: "error", message: error })
    }
})

app.listen(3333, () => console.log('Server is running on port 3333'))