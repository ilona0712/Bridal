import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Send, Sparkles } from "lucide-react";
import Header from "../components/common/Header";
import { ImageWithFallback } from "../assets/ImageWithFallback";

interface DressData {
  id: number;
  name: string;
  collection: string;
  price: number;
  image: string;
  sizes: number[];
  neckline: string;
  silhouette: string;
  fabric: string;
  trainLength: string;
  sleeveStyle: string;
}

type ChatMessage = { type: "bot" | "user"; text: string };

export default function IsabellaPage() {
  const location = useLocation();
  const dressFromGallery = (location.state as { dress?: DressData } | null)
    ?.dress;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const customizationQuestions = [
    {
      text: `Perfect choice! I love the ${
        dressFromGallery?.name || "dress you selected"
      }! ✨\n\nLet's customize it to make it uniquely yours. First, how would you like to change the neckline? The current style is ${
        dressFromGallery?.neckline || "classic"
      }, but we can try sweetheart, V-neck, off-shoulder, or anything else you're drawn to!`,
      response: "That neckline is going to look absolutely stunning on you! 💕",
    },
    {
      text: `Wonderful! Now let's talk about the silhouette. This dress currently has a ${
        dressFromGallery?.silhouette || "beautiful"
      } silhouette. Would you like to keep it, or explore something different like ball gown, A-line, mermaid, or sheath?`,
      response:
        "Perfect! That silhouette will be absolutely perfect for you! ✨",
    },
    {
      text: `Excellent choice! Let's discuss the fabric. Right now it's ${
        dressFromGallery?.fabric || "beautiful fabric"
      }, but we have so many options! Would you prefer luxurious satin, delicate lace, flowing chiffon, romantic tulle, or perhaps a combination?`,
      response:
        "Exquisite choice! That fabric will feel amazing and look even better. 💕",
    },
    {
      text: `Now, about the train - this is such a special detail! The current train is ${
        dressFromGallery?.trainLength || "elegant"
      }. Would you like to keep it, go more dramatic with a cathedral train, or perhaps something shorter?`,
      response:
        "That's going to look absolutely breathtaking as you walk down the aisle! ✨",
    },
    {
      text: `Almost done! The sleeves are currently ${
        dressFromGallery?.sleeveStyle || "beautiful"
      }. Would you like to change them? We can do sleeveless, delicate cap sleeves, romantic long sleeves, or anything you envision!`,
      response: "Perfect! That will complement the entire look beautifully. 💕",
    },
    {
      text: "Last question - are there any other special details or embellishments you'd love to add? Maybe beading, embroidery, buttons, a specific back design, or anything else that would make this dress uniquely yours?",
      response: `Thank you so much for customizing the ${
        dressFromGallery?.name || "dress"
      } with me! Based on all your choices, I can already see how stunning this dress will be on your special day.\n\nYour customized dress will be truly one-of-a-kind - a perfect reflection of your personal style. The changes you've made will create something absolutely magical! ✨💕\n\nWould you like me to save these customizations, or would you like to explore more options?`,
    },
  ];

  const generalQuestions = [
    {
      text: "Hello! I'm Isabella, your personal bridal consultant. I'm so excited to help you find your dream dress! 💕\n\nLet's start by getting to know your vision. Tell me, what overall style do you envision for your wedding day? Describe the feeling you want your dress to convey.",
      response:
        "That sounds absolutely beautiful! I can already picture you on your special day. ✨",
    },
    {
      text: "Now, let's talk about the neckline. What kind of neckline do you see yourself wearing? For example, do you prefer something romantic like a sweetheart neckline, modern like a V-neck, elegant like off-shoulder, or perhaps something else entirely?",
      response: "Wonderful choice! That will look stunning on you. 💕",
    },
    {
      text: "Perfect! Now I'd love to know about the silhouette. How do you imagine the overall shape of your dress? Are you drawn to the drama of a ball gown, the flattering lines of an A-line, the glamour of a fitted mermaid style, or perhaps something more streamlined?",
      response:
        "That silhouette will be absolutely perfect for you! I love this vision coming together. ✨",
    },
    {
      text: "Let's discuss fabric - this is where your dress really comes to life! What kind of fabric speaks to you? Maybe luxurious satin, delicate lace, flowing chiffon, romantic tulle, or perhaps a combination? Tell me what you're drawn to.",
      response:
        "Exquisite choice! That fabric will feel amazing and look even better. 💕",
    },
    {
      text: "Now, about the train - this is such a special detail! Are you imagining a dramatic cathedral-length train that makes a grand entrance, an elegant chapel train, something more subtle, or would you prefer no train at all for easier movement?",
      response:
        "That's going to look absolutely breathtaking as you walk down the aisle! ✨",
    },
    {
      text: "Almost done! Let's talk about sleeves. What are your thoughts on sleeve style? Would you like sleeveless for a classic look, delicate cap sleeves, romantic long sleeves, three-quarter length, or perhaps something unique?",
      response: "Perfect! That will complement the entire look beautifully. 💕",
    },
    {
      text: "Last question - are there any other special details, embellishments, or features you're dreaming of? Maybe beading, embroidery, buttons, a specific back design, or anything else that would make this dress uniquely yours?",
      response:
        "Thank you so much for sharing your beautiful vision with me! Based on everything you've told me, I have some absolutely stunning dresses in mind that would be perfect for you.\n\nI'm imagining a dress that captures your style perfectly - each detail you've described will come together to create something truly magical. ✨\n\nWould you like to see our gallery where we can find dresses that match your vision? Each one can be customized to your exact specifications!",
    },
  ];

  const questions = dressFromGallery
    ? customizationQuestions
    : generalQuestions;

  useEffect(() => {
    setCurrentQuestion(0);
    setMessages([{ type: "bot", text: questions[0].text }]);
    setInputValue("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dressFromGallery]);

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { type: "user", text: trimmed }]);
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: questions[currentQuestion].response },
      ]);

      if (currentQuestion < questions.length - 1) {
        setTimeout(() => {
          const next = currentQuestion + 1;
          setCurrentQuestion(next);
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: questions[next].text },
          ]);
        }, 1500);
      }
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const DressSidebar = () => {
    if (!dressFromGallery) return null;

    return (
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-200/50 bg-gradient-to-r from-stone-200 via-pink-100/30 to-stone-200">
            <p className="text-xs text-stone-600">Selected dress</p>
            <h3 className="font-serif text-lg text-stone-800 leading-tight">
              {dressFromGallery.name}
            </h3>
          </div>

          <div className="p-5 space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <ImageWithFallback
                src={dressFromGallery.image}
                alt={dressFromGallery.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-stone-800/70 backdrop-blur-sm rounded-full">
                <span className="text-xs text-white">
                  {dressFromGallery.collection}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-stone-700">
                <span className="text-stone-500">Neckline:</span>{" "}
                {dressFromGallery.neckline}
              </p>
              <p className="text-sm text-stone-700">
                <span className="text-stone-500">Silhouette:</span>{" "}
                {dressFromGallery.silhouette}
              </p>
              <p className="text-sm text-stone-700">
                <span className="text-stone-500">Fabric:</span>{" "}
                {dressFromGallery.fabric}
              </p>
              <p className="text-sm text-stone-700">
                <span className="text-stone-500">Train:</span>{" "}
                {dressFromGallery.trainLength}
              </p>
              <p className="text-sm text-stone-700">
                <span className="text-stone-500">Sleeves:</span>{" "}
                {dressFromGallery.sleeveStyle}
              </p>
              <p className="text-sm text-stone-700">
                <span className="text-stone-500">Sizes:</span>{" "}
                {dressFromGallery.sizes[0]}-
                {dressFromGallery.sizes[dressFromGallery.sizes.length - 1]}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
              <p className="font-medium text-stone-800">
                ${dressFromGallery.price.toLocaleString()}
              </p>

              <Link
                to="/gallery"
                className="text-xs text-stone-600 hover:text-stone-800 underline underline-offset-4"
              >
                Change dress
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header subtitle="Your Personal Bridal Consultant" />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {dressFromGallery && (
            <div className="hidden lg:block lg:col-span-1">
              <DressSidebar />
            </div>
          )}

          <div className={dressFromGallery ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/50 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-stone-200 via-pink-100/30 to-stone-200 px-6 py-5 border-b border-stone-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-stone-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-stone-800">
                      Isabella
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-300/60 rounded-full animate-pulse" />
                      <span className="text-sm text-stone-600">Online now</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-stone-50/30">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.type === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.type === "bot" && (
                      <div className="w-10 h-10 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex-shrink-0 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-stone-600" />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-5 py-4 max-w-[80%] ${
                        message.type === "bot"
                          ? "bg-white/90 border border-stone-200/50 rounded-tl-none"
                          : "bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 rounded-tr-none"
                      }`}
                    >
                      <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                        {message.text}
                      </p>
                    </div>

                    {message.type === "user" && (
                      <div className="w-10 h-10 bg-stone-200 rounded-full flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-stone-200/50 p-6 bg-white/40">
                <div className="flex gap-3 items-end">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer here..."
                    rows={1}
                    className="flex-1 bg-white/90 border border-stone-200 rounded-2xl px-5 py-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="w-12 h-12 bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 rounded-full flex items-center justify-center hover:shadow-lg transition-all flex-shrink-0"
                  >
                    <Send className="w-5 h-5 text-stone-700" />
                  </button>
                </div>

                <p className="text-xs text-stone-500 mt-3 text-center">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
