import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import fs from "fs";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const TENANT_ID = process.env.TENANT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

if (!CLIENT_ID || !TENANT_ID || !CLIENT_SECRET)
  throw new Error(
    "Missing required env vars: CLIENT_ID, TENANT_ID, CLIENT_SECRET"
  );

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    clientSecret: CLIENT_SECRET,
  },
});

interface Message {
  id: string;
  sender: { emailAddress: { name: string; address: string } };
  subject: string;
  receivedDateTime: string;
  bodyPreview: string;
}

interface ClassifiedMessage {
  id: string;
  category: string;
  confidence: number;
  receivedDateTime: string;
  subject: string;
  bodyPreview: string;
  senderName: string;
  senderAddress: string;
}

// !!! currently mocks values !!!
const classifyMessage = ({
  message,
}: {
  message: Message;
}): ClassifiedMessage => {
  const categories = ["Invoice", "Inquiry", "Supplier", "Personal"];
  
  return {
    id: message.id,
    receivedDateTime: message.receivedDateTime,
    subject: message.subject,
    bodyPreview: message.bodyPreview,
    senderName: message.sender.emailAddress.name,
    senderAddress: message.sender.emailAddress.address,
    category: categories[Math.floor(Math.random() * categories.length)]!,
    confidence: +Math.random().toFixed(2),
  };
  // return {
  //   id: message.id,
  //   category: categories[Math.floor(Math.random() * categories.length)]!,
  //   confidence: +Math.random().toFixed(2),
  // };
};

app.get("/", async (req, res) => {
  try {
    const result = await cca.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });

    if (!result || !result.accessToken) {
      return res.status(500).send("Failed to acquire access token");
    }

    const client = Client.init({
      authProvider: (done) => done(null, result.accessToken),
    });

    const messages = await client
      .api("/users/sales@anytimeoutfits.com/messages")
      .select("id,sender,subject,receivedDateTime,bodyPreview")
      .filter("isDraft eq false")
      .top(25)
      .get();

    const classifiedMessages = messages.value.map((message: Message) =>
      classifyMessage({ message })
    );

    fs.writeFileSync(
      path.join(__dirname, "..", "response.json"),
      JSON.stringify(messages.value, null, 2)
    );
    fs.writeFileSync(
      path.join(__dirname, "..", "classified_response.json"),
      JSON.stringify(classifiedMessages, null, 2)
    );

    res.status(200).json(classifiedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to retrieve emails");
  }
});

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
