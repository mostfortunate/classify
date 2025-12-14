import "./App.css";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface MessageProps {
  subject: string;
  receivedDateTime: string;
}

const Message = ({ subject, receivedDateTime }: MessageProps) => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h3 className="text-base font-semibold">{subject}</h3>
      <p className="text-sm text-gray-600">
        {new Date(receivedDateTime).toLocaleDateString()}
      </p>
    </div>
  );
};

function App() {
  const [messages, setMessages] = useState<ClassifiedMessage[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetch("http://localhost:3000/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, []);

  const categories = Array.from(new Set(messages.map((m) => m.category)));

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category);
        const categoryMessages = messages.filter(
          (message) => message.category === category
        );

        return (
          <div key={category} className="border border-gray-200 rounded-2xl">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <h2 className="text-xl font-bold">{category}</h2>
              <span className="text-sm text-gray-500">
                {categoryMessages.length}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {categoryMessages.map((message) => (
                      <Message
                        key={message.id}
                        subject={message.subject}
                        receivedDateTime={message.receivedDateTime}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default App;
