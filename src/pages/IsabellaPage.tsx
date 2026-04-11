import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Check, ChevronRight } from "lucide-react";
import Header from "../components/common/Header";
import { ImageWithFallback } from "../assets/ImageWithFallback";
import { supabase } from "../../lib/supabase";
import { useSession } from "../routes";

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

interface MCQOption {
  label: string;
  value: string;
}

interface BotQuestion {
  id: string;
  text: string;
  options: MCQOption[];
  key: keyof DressAnswers;
}

interface DressAnswers {
  occasion: string;
  neckline: string;
  silhouette: string;
  fabric: string;
  train: string;
  sleeves: string;
  embellishments: string;
  color: string;
}

type ChatMessage =
  | { type: "bot"; text: string; options?: MCQOption[]; questionId?: string }
  | { type: "user"; text: string };

const QUESTIONS: BotQuestion[] = [
  {
    id: "occasion",
    key: "occasion",
    text: "Hello! I'm MAI, your personal bridal consultant ✨\n\nLet's design your dream dress together. First — what's the occasion?",
    options: [
      { label: "💍 Wedding", value: "wedding" },
      { label: "🎉 Engagement Party", value: "engagement party" },
      { label: "🌸 Garden Party", value: "garden party" },
      { label: "✨ Black Tie Gala", value: "black tie gala" },
    ],
  },
  {
    id: "neckline",
    key: "neckline",
    text: "Lovely! Now, which neckline speaks to your soul?",
    options: [
      { label: "💕 Sweetheart", value: "sweetheart" },
      { label: "🔻 Deep V-Neck", value: "deep V-neck" },
      { label: "🌿 Off-Shoulder", value: "off-shoulder" },
      { label: "🎀 High Neck", value: "high neck" },
      { label: "✨ Scoop Neck", value: "scoop neck" },
    ],
  },
  {
    id: "silhouette",
    key: "silhouette",
    text: "Beautiful choice! What silhouette do you imagine yourself in?",
    options: [
      { label: "👸 Ball Gown", value: "ball gown" },
      { label: "🌊 Mermaid / Trumpet", value: "mermaid / trumpet" },
      { label: "🌸 A-Line", value: "A-line" },
      { label: "🪶 Sheath / Column", value: "sheath / column" },
      { label: "🎀 Empire Waist", value: "empire waist" },
    ],
  },
  {
    id: "fabric",
    key: "fabric",
    text: "Gorgeous! What fabric would make your dress feel like a dream?",
    options: [
      { label: "✨ Satin", value: "silk satin" },
      { label: "🪡 Lace", value: "intricate lace" },
      { label: "🌬️ Chiffon", value: "flowing chiffon" },
      { label: "🌟 Tulle", value: "layered tulle" },
      { label: "💎 Mikado", value: "structured mikado" },
    ],
  },
  {
    id: "train",
    key: "train",
    text: "Now the train — how dramatic do you want your entrance?",
    options: [
      { label: "👑 Cathedral (grand entrance!)", value: "cathedral train" },
      { label: "💫 Chapel (elegant sweep)", value: "chapel train" },
      { label: "🌸 Court (subtle & chic)", value: "court train" },
      { label: "🪶 No Train (free & light)", value: "no train" },
    ],
  },
  {
    id: "sleeves",
    key: "sleeves",
    text: "What about sleeves? What feels right for you?",
    options: [
      { label: "🌬️ Sleeveless", value: "sleeveless" },
      { label: "🌸 Cap Sleeves", value: "delicate cap sleeves" },
      { label: "✨ Long Lace Sleeves", value: "long lace sleeves" },
      { label: "🎀 Three-Quarter Sleeves", value: "three-quarter sleeves" },
      {
        label: "💫 Off-Shoulder Ruffles",
        value: "off-shoulder ruffle sleeves",
      },
    ],
  },
  {
    id: "embellishments",
    key: "embellishments",
    text: "Almost there! What details and embellishments are you drawn to?",
    options: [
      { label: "💎 Crystal Beading", value: "crystal beading" },
      { label: "🌸 Floral Appliqués", value: "3D floral appliqués" },
      { label: "✨ Sequin Sparkle", value: "all-over sequins" },
      { label: "🪡 Embroidery", value: "delicate embroidery" },
      { label: "🕊️ Clean & Minimal", value: "no embellishments, clean lines" },
    ],
  },
  {
    id: "color",
    key: "color",
    text: "Last one! What color palette are you envisioning?",
    options: [
      { label: "🤍 Ivory / Classic White", value: "ivory white" },
      { label: "🌸 Blush Pink", value: "blush pink" },
      { label: "🫧 Champagne / Cream", value: "champagne cream" },
      { label: "🖤 Dramatic Black", value: "black" },
      { label: "💙 Dusty Blue", value: "dusty blue" },
    ],
  },
];

function buildChatGPTPrompt(answers: DressAnswers, dress?: DressData): string {
  const base = dress
    ? `A custom bridal dress inspired by the "${dress.name}" (${dress.collection} collection), reimagined with the following customizations:`
    : `A custom bridal dress designed from scratch with these specifications:`;

  return `Generate a photorealistic fashion illustration or editorial photograph of the following custom dress:

${base}

— Occasion: ${answers.occasion}
— Neckline: ${answers.neckline}
— Silhouette: ${answers.silhouette}
— Fabric: ${answers.fabric}
— Train: ${answers.train}
— Sleeves: ${answers.sleeves}
— Embellishments: ${answers.embellishments}
— Color: ${answers.color}

Style direction: High-fashion editorial. Studio lighting with a clean white or soft blush background. The model should be shown in a full-length pose to showcase the entire dress. Ultra-detailed fabric texture, photorealistic rendering, luxury bridal magazine quality.`;
}

export default function IsabellaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const dressFromGallery = (location.state as { dress?: DressData } | null)
    ?.dress;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<Partial<DressAnswers>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch the logged-in user's avatar
  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("profiles")
      .select("profile_image_url")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setMyAvatarUrl(data?.profile_image_url ?? null));
  }, [session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    const firstQ = QUESTIONS[0];
    const intro = dressFromGallery
      ? `Hello! I'm MAI ✨\n\nI see you've chosen the gorgeous "${dressFromGallery.name}" — wonderful taste! Let's customize it to be uniquely yours. I'll ask you a few quick questions.\n\n${firstQ.text}`
      : firstQ.text;

    setMessages([
      {
        type: "bot",
        text: intro,
        options: firstQ.options,
        questionId: firstQ.id,
      },
    ]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsComplete(false);
    setRequestSent(false);
    setAnsweredQuestions(new Set());
  }, [dressFromGallery]);

  const handleOptionSelect = (questionId: string, option: MCQOption) => {
    // Prevent re-answering
    if (answeredQuestions.has(questionId)) return;

    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    setAnsweredQuestions((prev) => new Set(prev).add(questionId));

    const newAnswers = { ...answers, [question.key]: option.value };
    setAnswers(newAnswers);

    // Add user selection bubble
    setMessages((prev) => [...prev, { type: "user", text: option.label }]);

    const nextIndex = QUESTIONS.findIndex((q) => q.id === questionId) + 1;

    setTimeout(() => {
      if (nextIndex < QUESTIONS.length) {
        const nextQ = QUESTIONS[nextIndex];
        setCurrentQuestionIndex(nextIndex);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: nextQ.text,
            options: nextQ.options,
            questionId: nextQ.id,
          },
        ]);
      } else {
        // All answered
        setIsComplete(true);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: `Magnifique! ✨ I have everything I need to envision your dream dress.\n\nBased on your choices, I've crafted a detailed design prompt below. When you're ready, click **"Request This Style"** to send it to our designer — they'll use it to generate a visual of your dress and reach out to discuss next steps!`,
          },
        ]);
      }
    }, 600);
  };

  const fullAnswers = answers as DressAnswers;
  const prompt = isComplete
    ? buildChatGPTPrompt(fullAnswers, dressFromGallery)
    : "";

  const handleRequestStyle = async () => {
    if (!session?.user || isSending) return;

    setIsSending(true);
    try {
      // Get or create the customer's conversation
      let conversationId: string;
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("customer_id", session.user.id)
        .maybeSingle();

      if (existing) {
        conversationId = existing.id;
      } else {
        const { data: created, error } = await supabase
          .from("conversations")
          .insert({ customer_id: session.user.id })
          .select("id")
          .single();
        if (error || !created) throw error;
        conversationId = created.id;
      }

      // Send the prompt as a message from the customer
      const messageContent = `✨ **Custom Dress Request**\n\nHi! I've designed my dream dress using MAI. Here is the full design prompt — feel free to paste it into ChatGPT / DALL·E to generate a visual, then let's chat about it!\n\n---\n\n${prompt}`;

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        content: messageContent,
        sender_type: "customer",
      });

      setRequestSent(true);

      // Navigate to the chat page after a moment
      setTimeout(() => {
        navigate("/chat");
      }, 1500);
    } catch (err) {
      console.error("Failed to send request:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const DressSidebar = () => {
    if (!dressFromGallery) return null;
    return (
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-stone-200 via-pink-100/30 to-stone-200 dark:from-stone-700 dark:via-pink-900/20 dark:to-stone-700 px-5 py-4 border-b border-stone-200/50 dark:border-stone-700/50">
            <h3 className="font-serif text-lg text-stone-800 dark:text-stone-100">
              Base Dress
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {dressFromGallery.collection}
            </p>
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
              {[
                ["Neckline", dressFromGallery.neckline],
                ["Silhouette", dressFromGallery.silhouette],
                ["Fabric", dressFromGallery.fabric],
                ["Train", dressFromGallery.trainLength],
                ["Sleeves", dressFromGallery.sleeveStyle],
                [
                  "Sizes",
                  `${dressFromGallery.sizes[0]}–${dressFromGallery.sizes[dressFromGallery.sizes.length - 1]}`,
                ],
              ].map(([label, value]) => (
                <p
                  key={label}
                  className="text-sm text-stone-700 dark:text-stone-200"
                >
                  <span className="text-stone-500 dark:text-stone-400">
                    {label}:
                  </span>{" "}
                  {value}
                </p>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 dark:border-stone-700/50">
              <p className="font-medium text-stone-800 dark:text-stone-100">
                ${dressFromGallery.price.toLocaleString()}
              </p>
              <Link
                to="/gallery"
                className="text-xs text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 underline underline-offset-4"
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <Header subtitle="Your Personal Bridal Consultant" />

              {/* Messages */}
              <div className="relative flex-1 min-h-0">
              {/* blur-fade overlay */}
              <div
                className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"
                style={{
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
                }}
              />
              {/* MAI name — above the blur */}
              <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-6 py-3">
                <Sparkles className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span className="font-serif text-stone-700 dark:text-stone-200">MAI</span>
              </div>
              <div className="absolute inset-0 overflow-y-auto pt-16 p-6 space-y-5 bg-stone-50/30 dark:bg-stone-900/30">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : ""}`}
                  >
                    {message.type === "bot" && (
                      <div className="w-10 h-10 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex-shrink-0 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-stone-600" />
                      </div>
                    )}

                    <div className="flex flex-col gap-3 max-w-[85%]">
                      <div
                        className={`rounded-2xl px-5 py-4 ${
                          message.type === "bot"
                            ? "bg-white/90 dark:bg-stone-700/90 border border-stone-200/50 dark:border-stone-600/50 rounded-tl-none"
                            : "bg-gradient-to-br from-stone-300 via-pink-200/40 to-stone-300 dark:from-stone-600 dark:via-pink-900/20 dark:to-stone-600 rounded-tr-none self-end"
                        }`}
                      >
                        <p className="text-sm text-stone-800 dark:text-stone-100 leading-relaxed whitespace-pre-line">
                          {message.text}
                        </p>
                      </div>

                      {/* MCQ Options — only show for bot messages with options */}
                      {message.type === "bot" &&
                        message.options &&
                        message.questionId && (
                          <div className="flex flex-wrap gap-2 ml-0">
                            {message.options.map((opt) => {
                              const isAnswered = answeredQuestions.has(
                                message.questionId!,
                              );
                              const isSelected =
                                isAnswered &&
                                answers[
                                  QUESTIONS.find(
                                    (q) => q.id === message.questionId,
                                  )?.key as keyof DressAnswers
                                ] === opt.value;

                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() =>
                                    handleOptionSelect(message.questionId!, opt)
                                  }
                                  disabled={isAnswered}
                                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                                  ${
                                    isSelected
                                      ? "bg-gradient-to-r from-pink-200/60 to-stone-200 border-pink-300 text-stone-800 shadow-sm scale-[0.98]"
                                      : isAnswered
                                        ? "bg-white/40 dark:bg-stone-700/40 border-stone-200/30 dark:border-stone-600/30 text-stone-400 dark:text-stone-500 cursor-default"
                                        : "bg-white/80 dark:bg-stone-700/80 border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 hover:shadow-sm cursor-pointer"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                                  )}
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                    </div>

                    {message.type === "user" && (
                      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-stone-200 dark:bg-stone-600">
                        {myAvatarUrl ? (
                          <img
                            src={myAvatarUrl}
                            alt="You"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-stone-300 via-pink-100/30 to-stone-400" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              </div>{/* end relative messages wrapper */}

              {/* Completion Panel */}
              {isComplete && (
                <div className="border-t border-stone-200/50 dark:border-stone-700/50 p-6 bg-white/40 dark:bg-stone-800/40 space-y-4">
                  {/* Request button */}
                  {!requestSent ? (
                    <button
                      type="button"
                      onClick={handleRequestStyle}
                      disabled={isSending || !session?.user}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-stone-700 via-pink-900/30 to-stone-700 dark:from-stone-800 dark:via-pink-900/40 dark:to-stone-800 text-white rounded-2xl font-serif text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    >
                      <Sparkles className="w-5 h-5 text-pink-300" />
                      {isSending
                        ? "Sending to designer…"
                        : "Request This Style from Our Designer"}
                      <ChevronRight className="w-5 h-5 text-pink-300" />
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl text-green-700 dark:text-green-300 font-medium">
                      <Check className="w-5 h-5" />
                      Request sent! Redirecting you to the chat…
                    </div>
                  )}

                  {!session?.user && (
                    <p className="text-center text-xs text-stone-500 dark:text-stone-400">
                      <Link
                        to="/login"
                        className="underline underline-offset-2 hover:text-stone-800 dark:hover:text-stone-200"
                      >
                        Sign in
                      </Link>{" "}
                      to send your request to our designer
                    </p>
                  )}

                  <p className="text-center text-xs text-stone-400 dark:text-stone-500">
                    The designer will receive your specifications, generate a
                    visual of your dress, and reach out to discuss details.
                  </p>
                </div>
              )}

              {/* Placeholder while chatting (no text input — MCQ only) */}
              {!isComplete && (
                <div className="border-t border-stone-200/50 dark:border-stone-700/50 px-6 py-4 bg-white/30 dark:bg-stone-800/30">
                  <p className="text-center text-xs text-stone-400 dark:text-stone-500 flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    Select an option above to continue •{" "}
                    <span className="font-medium text-stone-500 dark:text-stone-400">
                      {currentQuestionIndex + 1} / {QUESTIONS.length}
                    </span>
                  </p>
                </div>
              )}
    </div>
  );
}
