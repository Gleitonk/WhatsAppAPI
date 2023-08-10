import express, { Request, Response } from "express";
import Sender from "./sender";

const sender = new Sender();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.listen(process.env.PORT);
app.listen(3333);

app.use(async (req, res, next) => {
  if (!sender) {
    return res.status(500).json({ error: "Not ready." });
  }

  next();
});

app.get("/status", async (req: Request, res: Response) => {
  if (sender.isConnected === undefined) {
    return res.send("Not Connected");
  }

  if (sender.isConnected === false || sender.isAuthenticated === false) {
    return res.send({
      qr_code: sender.qrCode,
      connected: sender.isConnected,
      authenticated: sender.isAuthenticated,
    });
  }

  return res.send({
    connected: sender.isConnected,
    authenticated: sender.isAuthenticated,
  });
});

app.post("/send", async (req: Request, res: Response) => {
  try {
    const { number, message } = req.body;

    await sender.sendMessage(number, message);

    return res.status(200).send("Message sent!");
  } catch (error) {
    res.status(500).json({ status: "error", message: error });
    console.log(error);
  }
});

app.post("/sendMultiple", async (req: Request, res: Response) => {
  try {
    const { numbers, message } = req.body;

    const { listOfInvalidNumbers, not_sent_amount } =
      await sender.sendMultipleMessages(numbers, message);

    return res.status(200).json({ listOfInvalidNumbers, not_sent_amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error });
  }
});

app.post("/resetState", async (req: Request, res: Response) => {
  try {
    const { passphrase } = req.body;

    const isAllowed =
      passphrase === "A#j$sj0CVrUld!p8tEmhrUu8r7bL0R&k80k8ZCJH7R9Us^";

    console.log(isAllowed);

    if (!isAllowed) {
      res.status(401);
      return;
    }

    await sender.resetState();

    return res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error });
  }
});
