import { create, SocketState, Whatsapp } from 'venom-bot';
import { validateAndFormatPhoneNumber } from './util';

export type QrCode = {
    base64Qr: string
    asciiQR: string
    attempts: number
}

export type InvalidNUmbersList = {
    listOfInvalidNumbers: string[]
    not_sent_amount: number
}

class Sender {
    private client: Whatsapp
    private connected: boolean
    private qr: QrCode

    get isConnected(): boolean {
        return this.connected
    }

    get qrCode(): QrCode {
        return this.qr
    }

    constructor() {
        this.initialize()
    }

    private initialize() {

        const qr = (
            base64Qr: string,
            asciiQR: string,
            attempts: number
        ) => {
            this.qr = { base64Qr, attempts, asciiQR }
        }

        const status = (statusSession: string) => {
            this.connected = ["IsLogged", "qrReadSuccess", "chatsAvailable"]
                .includes(statusSession)
        }

        const start = (client: Whatsapp) => {
            this.client = client

            client.onStateChange(state => {
                this.connected = state === SocketState.CONNECTED
            })
        }

        create('ws-sender', qr)
            .then((client) => start(client))
            .catch((error) => console.error(error));
    }

    async sendMessage(to: string, body: string) {

        const validatedNumber = validateAndFormatPhoneNumber(to)

        if (!validatedNumber) {
            throw 'Número Whatsapp inválido!'
        }

        await this.client.sendText(validatedNumber, body)
    }


    async sendMultipleMessages(listOfPhoneNumbers: string[], body: string): Promise<InvalidNUmbersList> {
        let listOfInvalidNumbers: string[] = [];

        for (const phone of listOfPhoneNumbers) {

            const validatedNumber = validateAndFormatPhoneNumber(phone)


            if (!validatedNumber) {
                listOfInvalidNumbers.push(phone)
                continue
            }

            await this.client.sendText(validatedNumber, body)
                .catch(() => {
                    listOfInvalidNumbers.push(phone)
                })
        }

        return { listOfInvalidNumbers, not_sent_amount: listOfInvalidNumbers.length }
    }



}


export default Sender 