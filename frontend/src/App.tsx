import "./App.css";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

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

interface ProgressCircleProps {
  score: number;
}

const ProgressCircle = ({ score }: ProgressCircleProps) => {
  const radius = 20;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClass =
    progress >= 75
      ? "text-green-500"
      : progress >= 50
      ? "text-yellow-500"
      : progress >= 25
      ? "text-orange-500"
      : "text-red-500";
  return (
    <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="currentColor"
          className="text-gray-200"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke="currentColor"
          className={colorClass}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center text-md font-bold">
        {Math.round(progress)}
      </div>
    </div>
  );
};

interface MessageProps {
  sender: { name: string; address: string };
  subject: string;
  preview: string;
  receivedDateTime: string;
  score: number;
}

const Message = ({
  sender,
  subject,
  preview,
  receivedDateTime,
  score,
}: MessageProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setExpanded((v) => !v)}
      className="
    p-4 border rounded-lg flex flex-col cursor-pointer
    transition-colors hover:bg-muted/40
  "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <ProgressCircle score={score} />
          <div className="flex flex-col min-w-0">
            <h3 className="text-left text-sm font-medium line-clamp-1">
              {subject}
            </h3>
            <p className="text-left text-xs text-muted-foreground line-clamp-1">
              {sender.name} &lt;{sender.address}&gt; •{" "}
              {new Date(receivedDateTime).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="rounded-full"
          aria-label="Open in Outlook"
          size="icon"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 text-left mt-2 border-t text-sm text-muted-foreground">
              {preview}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface MessageListProps {
  messages: ClassifiedMessage[];
}

const MessageList = ({ messages }: MessageListProps) => (
  <div className="p-4 space-y-3">
    {messages.map((message) => (
      <Message
        sender={{ name: message.senderName, address: message.senderAddress }}
        key={message.id}
        preview={message.bodyPreview}
        subject={message.subject}
        receivedDateTime={message.receivedDateTime}
        score={message.confidence * 100}
      />
    ))}
  </div>
);

interface CategoryHeaderProps {
  title: string;
  count: number;
  onClick: () => void;
  containsUnread?: boolean;
}

const CategoryHeader = ({ title, count, onClick, containsUnread }: CategoryHeaderProps) => (
  <button
    onClick={onClick}
    className="w-full flex justify-between items-center p-4 text-left"
  >
    <h2 className="text-xl font-bold">{title}</h2>
    <div className="flex flex-row">
      <span className="text-sm text-gray-500">{count}</span>
      {containsUnread && <div className="h-1 w-1 bg-red-500 rounded-full"/>}
    </div>
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
      containsUnread={true}
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
