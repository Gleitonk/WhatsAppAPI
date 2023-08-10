import { Client, LocalAuth, WAState } from "whatsapp-web.js";
import { validateAndFormatPhoneNumber } from "./util";
import * as QrCode from "qrcode";

export type InvalidNUmbersList = {
  listOfInvalidNumbers: string[];
  not_sent_amount: number;
};

class Sender {
  private client: Client;
  private connected: boolean;
  private authenticated: boolean;
  private qr: string;

  get isConnected(): boolean {
    return this.connected;
  }

  get isAuthenticated(): boolean {
    return this.authenticated;
  }

  get qrCode(): string {
    return this.qr;
  }

  constructor() {
    this.initialize();
  }

  private initialize() {
    const qr = (qrCode: string) => {
      QrCode.toString(
        qrCode,
        { type: "terminal", small: true },
        (err, qrCode) => {
          if (err) {
            console.error(err);
          }

          console.log(qrCode);
        }
      );

      this.qr = qrCode;
    };

    const start = () => {
      this.client = client;
      this.connected = true;
    };

    const authenticated = () => {
      this.authenticated = true;
    };

    const onAuthFailure = (reason: string) => {
      this.authenticated = false;
      console.error("AUTH_FAILED", reason);
    };

    const onChangeState = (state: WAState) => {
      this.connected = state === WAState.CONNECTED;
    };

    const onDisconnect = (reason: WAState | "NAVIGATION") => {
      this.connected = false;

      console.error("Disconnected", reason);
    };

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: "gestao",
        dataPath: "tokens",
      }),
      puppeteer: {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      },
    });

    client.on("qr", qr);

    client.on("ready", start);

    client.on("change_state", onChangeState);

    client.on("authenticated", authenticated);

    client.on("auth_failure", onAuthFailure);

    client.on("disconnected", onDisconnect);

    client.initialize();
  }

  async getStatus() {
    if (!this.client) {
      return { connected: false, authenticated: false };
    }

    const state = await this.client.getState();

    this.connected = state === WAState.CONNECTED;
    return { connected: this.connected, authenticated: this.authenticated };
  }

  async sendMessage(to: string, body: string) {
    const validatedNumber = validateAndFormatPhoneNumber(to);

    if (!validatedNumber) {
      throw "Número Whatsapp inválido!";
    }

    await this.client.sendMessage(validatedNumber, body);
  }

  async sendMultipleMessages(
    listOfPhoneNumbers: string[],
    body: string
  ): Promise<InvalidNUmbersList> {
    let listOfInvalidNumbers: string[] = [];

    for (const phone of listOfPhoneNumbers) {
      const validatedNumber = validateAndFormatPhoneNumber(phone);

      if (!validatedNumber) {
        listOfInvalidNumbers.push(phone);
        continue;
      }

      await this.client.sendMessage(validatedNumber, body).catch(() => {
        listOfInvalidNumbers.push(phone);
      });
    }

    return {
      listOfInvalidNumbers,
      not_sent_amount: listOfInvalidNumbers.length,
    };
  }

  async resetState() {
    await this.client.resetState();
  }
}

export default Sender;
