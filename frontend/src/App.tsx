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

function useMessages() {
  const [messages, setMessages] = useState<ClassifiedMessage[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/messages")
      .then((res) => res.json())
      .then(setMessages);
  }, []);

  return messages;
}

interface MessageProps {
  subject: string;
  receivedDateTime: string;
}

const Message = ({ subject, receivedDateTime }: MessageProps) => (
  <div className="p-4 border border-gray-300 rounded-lg">
    <h3 className="text-base font-semibold">{subject}</h3>
    <p className="text-sm text-gray-600">
      {new Date(receivedDateTime).toLocaleDateString()}
    </p>
  </div>
);

interface MessageListProps {
  messages: ClassifiedMessage[];
}

const MessageList = ({ messages }: MessageListProps) => (
  <div className="p-4 space-y-3">
    {messages.map((message) => (
      <Message
        key={message.id}
        subject={message.subject}
        receivedDateTime={message.receivedDateTime}
      />
    ))}
  </div>
);

interface CategoryHeaderProps {
  title: string;
  count: number;
  onClick: () => void;
}

const CategoryHeader = ({ title, count, onClick }: CategoryHeaderProps) => (
  <button
    onClick={onClick}
    className="w-full flex justify-between items-center p-4 text-left"
  >
    <h2 className="text-xl font-bold">{title}</h2>
    <span className="text-sm text-gray-500">{count}</span>
  </button>
);

interface AnimatedCollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
}

const AnimatedCollapse = ({ isOpen, children }: AnimatedCollapseProps) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        key="content"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

interface CategorySectionProps {
  category: string;
  messages: ClassifiedMessage[];
  isExpanded: boolean;
  onToggle: (category: string) => void;
}

const CategorySection = ({
  category,
  messages,
  isExpanded,
  onToggle,
}: CategorySectionProps) => (
  <div className="border border-gray-200 rounded-2xl">
    <CategoryHeader
      title={category}
      count={messages.length}
      onClick={() => onToggle(category)}
    />

    <AnimatedCollapse isOpen={isExpanded}>
      <MessageList messages={messages} />
    </AnimatedCollapse>
  </div>
);

function App() {
  const messages = useMessages();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const categories = Array.from(new Set(messages.map((m) => m.category)));

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          messages={messages.filter((m) => m.category === category)}
          isExpanded={expandedCategories.has(category)}
          onToggle={toggleCategory}
        />
      ))}
    </div>
  );
}

export default App;
