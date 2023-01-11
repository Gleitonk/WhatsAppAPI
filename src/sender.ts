import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js';
import { create, SocketState, Whatsapp } from 'venom-bot';

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

        create('ws-sender', qr, status)
            .then((client) => start(client))
            .catch((error) => console.error(error));
    }

    async sendMessage(to: string, body: string) {
        if (!isValidPhoneNumber(to, "BR")) {
            throw new Error('Número Whatsapp inválido!')
        }

        let phoneNumber = parsePhoneNumber(to, "BR")?.format("E.164").replace('+', '') as string

        phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`

        await this.client.sendText(phoneNumber, body)
    }


    async sendMultipleMessages(listOfPhoneNumbers: string[], body: string): Promise<InvalidNUmbersList> {
        let listOfInvalidNumbers: string[] = [];

        for (const phone of listOfPhoneNumbers) {

            const validatedNumber = this.validateAndFormatPhoneNumber(phone)
            

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

    validateAndFormatPhoneNumber(stringToCheck: string) {

        if (!isValidPhoneNumber(stringToCheck, "BR")) {
            return false
        }

        let phoneNumber = parsePhoneNumber(stringToCheck, "BR")?.format("E.164").replace('+', '') as string

        phoneNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`

        return phoneNumber;
    }

}


export default Sender 