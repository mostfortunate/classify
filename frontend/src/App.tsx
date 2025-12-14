import "./App.css";
import { useEffect, useState } from "react";

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


function App() {
  const [messages, setMessages] = useState<ClassifiedMessage[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, []);
  return (
    <>
      {/* <pre>{JSON.stringify(messages, null, 2)}</pre> */}
    </>
  );
}

export default App;
