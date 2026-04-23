import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import Header from "../components/common/Header";
import { supabase } from "../../lib/supabase";
import { useSession } from "../routes";
import type { Dress } from "../types/dress";
import { sendPushNotification } from "../services/pushNotificationService";

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

type PartialDressAnswers = Partial<DressAnswers>;

type ChatMessage =
  | { type: "bot"; text: string; options?: MCQOption[]; questionId?: string }
  | { type: "user"; text: string };

const OCCASION_OPTIONS: MCQOption[] = [
  { label: "💍 Wedding", value: "wedding" },
  { label: "🎉 Engagement Party", value: "engagement party" },
  { label: "🌸 Garden Party", value: "garden party" },
  { label: "✨ Black Tie Gala", value: "black tie gala" },
];

const NECKLINE_OPTIONS: MCQOption[] = [
  { label: "💕 Sweetheart", value: "sweetheart" },
  { label: "🔻 Deep V-Neck", value: "deep V-neck" },
  { label: "🌿 Off-Shoulder", value: "off-shoulder" },
  { label: "🎀 High Neck", value: "high neck" },
  { label: "✨ Scoop Neck", value: "scoop neck" },
];

const SILHOUETTE_OPTIONS: MCQOption[] = [
  { label: "👸 Ball Gown", value: "ball gown" },
  { label: "🌊 Mermaid / Trumpet", value: "mermaid / trumpet" },
  { label: "🌸 A-Line", value: "A-line" },
  { label: "🪶 Sheath / Column", value: "sheath / column" },
  { label: "🎀 Empire Waist", value: "empire waist" },
];

const FABRIC_OPTIONS: MCQOption[] = [
  { label: "✨ Satin", value: "silk satin" },
  { label: "🪡 Lace", value: "intricate lace" },
  { label: "🌬️ Chiffon", value: "flowing chiffon" },
  { label: "🌟 Tulle", value: "layered tulle" },
  { label: "💎 Mikado", value: "structured mikado" },
];

const TRAIN_OPTIONS: MCQOption[] = [
  { label: "👑 Cathedral (grand entrance!)", value: "cathedral train" },
  { label: "💫 Chapel (elegant sweep)", value: "chapel train" },
  { label: "🌸 Court (subtle & chic)", value: "court train" },
  { label: "🪶 No Train (free & light)", value: "no train" },
];

const SLEEVE_OPTIONS: MCQOption[] = [
  { label: "🌬️ Sleeveless", value: "sleeveless" },
  { label: "🌸 Cap Sleeves", value: "delicate cap sleeves" },
  { label: "✨ Long Lace Sleeves", value: "long lace sleeves" },
  { label: "🎀 Three-Quarter Sleeves", value: "three-quarter sleeves" },
  { label: "💫 Off-Shoulder Ruffles", value: "off-shoulder ruffle sleeves" },
];

const EMBELLISHMENT_OPTIONS: MCQOption[] = [
  { label: "💎 Crystal Beading", value: "crystal beading" },
  { label: "🌸 Floral Appliqués", value: "3D floral appliqués" },
  { label: "✨ Sequin Sparkle", value: "all-over sequins" },
  { label: "🪡 Embroidery", value: "delicate embroidery" },
  { label: "🕊️ Clean & Minimal", value: "no embellishments, clean lines" },
];

const COLOR_OPTIONS: MCQOption[] = [
  { label: "🤍 Ivory / Classic White", value: "ivory white" },
  { label: "🌸 Blush Pink", value: "blush pink" },
  { label: "🫧 Champagne / Cream", value: "champagne cream" },
  { label: "🖤 Dramatic Black", value: "black" },
  { label: "💙 Dusty Blue", value: "dusty blue" },
];

function buildQuestionsForDress(dress: Dress): BotQuestion[] {
  const { neckline, silhouette, fabric, trainLength, sleeveStyle } = dress;

  return [
    {
      id: "occasion",
      key: "occasion",
      text: `Hello! I'm MAI, your personal bridal consultant ✨\n\nLet's customize the ${dress.name} to be uniquely yours. First — what's the occasion?`,
      options: OCCASION_OPTIONS,
    },
    {
      id: "neckline",
      key: "neckline",
      text: neckline
        ? `Your dress features a ${neckline} neckline — a beautiful choice. Would you like to keep it, or explore something different?`
        : "Which neckline speaks to your soul?",
      options: NECKLINE_OPTIONS,
    },
    {
      id: "silhouette",
      key: "silhouette",
      text: silhouette
        ? `The ${dress.name} has a gorgeous ${silhouette} silhouette. Is this the look you're going for, or would you like to try a different shape?`
        : "What silhouette do you imagine yourself in?",
      options: SILHOUETTE_OPTIONS,
    },
    {
      id: "fabric",
      key: "fabric",
      text: fabric
        ? `This dress is crafted in ${fabric}. Would you like to keep this fabric, or dream in something else entirely?`
        : "What fabric would make your dress feel like a dream?",
      options: FABRIC_OPTIONS,
    },
    {
      id: "train",
      key: "train",
      text: trainLength
        ? `The dress comes with a ${trainLength} train. Would you like to keep it, or customize the length?`
        : "How dramatic do you want your entrance?",
      options: TRAIN_OPTIONS,
    },
    {
      id: "sleeves",
      key: "sleeves",
      text: sleeveStyle
        ? `This style features ${sleeveStyle}. Does that feel right for you, or would you prefer something different?`
        : "What about sleeves — what feels right for you?",
      options: SLEEVE_OPTIONS,
    },
    {
      id: "embellishments",
      key: "embellishments",
      text: "Almost there! What details and embellishments are you drawn to?",
      options: EMBELLISHMENT_OPTIONS,
    },
    {
      id: "color",
      key: "color",
      text: "Last one! What color palette are you envisioning?",
      options: COLOR_OPTIONS,
    },
  ];
}

function getDressAttributeForQuestion(dress: Dress, questionId: string): string {
  switch (questionId) {
    case "neckline": return dress.neckline?.toLowerCase() || "";
    case "silhouette": return dress.silhouette?.toLowerCase() || "";
    case "fabric": return dress.fabric?.toLowerCase() || "";
    case "train": return dress.trainLength?.toLowerCase() || "";
    case "sleeves": return dress.sleeveStyle?.toLowerCase() || "";
    default: return "";
  }
}

function isCurrentDressOption(optionValue: string, dressAttr: string): boolean {
  if (!dressAttr) return false;
  const opt = optionValue.toLowerCase();
  const attr = dressAttr.toLowerCase();
  return opt.includes(attr) || attr.includes(opt);
}

const FIELD_LABELS: Record<keyof DressAnswers, string> = {
  occasion: "Occasion",
  neckline: "Neckline",
  silhouette: "Silhouette",
  fabric: "Fabric",
  train: "Train",
  sleeves: "Sleeves",
  embellishments: "Embellishments",
  color: "Color",
};

function getSelectedAnswerLines(answers: PartialDressAnswers) {
  return (Object.entries(FIELD_LABELS) as Array<[keyof DressAnswers, string]>)
    .flatMap(([key, label]) =>
      answers[key] ? [`- ${label}: ${answers[key]}`] : [],
    );
}

function buildChatGPTPrompt(answers: PartialDressAnswers): string {
  const selectedLines = getSelectedAnswerLines(answers);

  if (selectedLines.length === 0) {
    return "";
  }

  return `Edit this bridal gown product image. The model's face, hair, skin, hands, body proportions, pose, camera angle, lighting, and background must remain unchanged.
This must look like the same original photograph with only the dress redesigned.

STRICT INSTRUCTIONS:
- Keep the same model, face, body, pose, and proportions
- Keep the same camera angle, framing, lighting, and background
- Do not change anything outside the dress

Modify ONLY the dress design according to the following:

${selectedLines.join("\n")}

DESIGN PRIORITY:
1. Silhouette and structure must be accurate
2. Neckline and sleeves must match exactly
3. Fabric texture must look realistic (satin, lace, chiffon, etc.)
4. Embellishments should be refined and not excessive

QUALITY REQUIREMENTS:
- Photorealistic luxury bridal gown
- Clean construction, no distortions
- Natural fabric folds and draping
- No blurriness or artifacts
- Maintain high-end fashion editorial quality

DO NOT:
- Change the model identity
- Add or remove limbs or alter hands
- Change background or environment
- Introduce unrealistic shapes or textures`;
}

function buildRequestSummary(answers: PartialDressAnswers, dress?: Dress) {
  const details = getSelectedAnswerLines(answers);

  return [
    "Hello Designer! Here's a my custom dress request from MAI, the personal bridal consultant chatbot.",
    dress ? `Inspired by: ${dress.name}` : null,
    dress && dress.collections.length > 0
      ? `Collection: ${dress.collections.join(", ")}`
      : null,
    "",
    "I selected the following options:",
    ...details,
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n");
}

export default function IsabellaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const dressFromGallery = (location.state as { dress?: Dress } | null)?.dress;

  const questions = useMemo(
    () => (dressFromGallery ? buildQuestionsForDress(dressFromGallery) : []),
    [dressFromGallery],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<PartialDressAnswers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dressFromGallery) {
      navigate("/gallery", { replace: true });
    }
  }, [dressFromGallery, navigate]);

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

  useEffect(() => {
    if (!dressFromGallery || questions.length === 0) return;

    const firstQ = questions[0];
    setMessages([
      {
        type: "bot",
        text: firstQ.text,
        options: firstQ.options,
        questionId: firstQ.id,
      },
    ]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsComplete(false);
    setRequestSent(false);
    setAnsweredQuestions(new Set());
  }, [dressFromGallery, questions]);

  const advanceToNextQuestion = (
    questionId: string,
    userMessage: string,
    answerPatch?: PartialDressAnswers,
  ) => {
    if (answeredQuestions.has(questionId)) return;

    const question = questions.find((item) => item.id === questionId);
    if (!question) return;

    setAnsweredQuestions((prev) => new Set(prev).add(questionId));
    if (answerPatch) {
      setAnswers((prev) => ({ ...prev, ...answerPatch }));
    }
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);

    const nextIndex = questions.findIndex((item) => item.id === questionId) + 1;

    setTimeout(() => {
      if (nextIndex < questions.length) {
        const nextQuestion = questions[nextIndex];
        setCurrentQuestionIndex(nextIndex);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: nextQuestion.text,
            options: nextQuestion.options,
            questionId: nextQuestion.id,
          },
        ]);
        return;
      }

      setIsComplete(true);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: 'Magnifique! ✨ I have everything I need to prepare your request.\n\nWhen you click "Request This Style", I will send a clean summary to your chat and place the full design prompt into our internal review queue for designer approval.',
        },
      ]);
    }, 600);
  };

  const handleOptionSelect = (questionId: string, option: MCQOption) => {
    const question = questions.find((item) => item.id === questionId);
    if (!question) return;

    advanceToNextQuestion(questionId, option.label, {
      [question.key]: option.value,
    });
  };

  const handleSkipQuestion = (questionId: string) => {
    advanceToNextQuestion(questionId, "Skipped this option");
  };

  const selectedAnswerCount = Object.values(answers).filter(Boolean).length;
  const prompt = isComplete ? buildChatGPTPrompt(answers) : "";

  const handleRequestStyle = async () => {
    if (!session?.user || isSending || !dressFromGallery) return;

    setIsSending(true);
    try {
      if (selectedAnswerCount === 0) {
        alert("Please choose at least one customization option before sending your request.");
        return;
      }

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

      const requestSummary = buildRequestSummary(answers, dressFromGallery);
      const designerStatusMessage =
        "MAI has submitted this customization request for designer review.\n\nPlease be patient, we will be back to you as soon as possible with the next steps!";

      if (dressFromGallery?.image) {
        const { error: imageMessageError } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          content: dressFromGallery.image,
          sender_type: "customer",
          attachment_url: dressFromGallery.image,
          attachment_type: "image",
        });

        if (imageMessageError) throw imageMessageError;
      }

      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        content: requestSummary,
        sender_type: "customer",
      });

      if (messageError) throw messageError;

      const { error: designerMessageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          content: designerStatusMessage,
          sender_type: "designer",
        });

      if (designerMessageError) throw designerMessageError;

      const { data: requestRow, error: requestError } = await supabase
        .from("chatbot_sessions")
        .insert({
          customer_id: session.user.id,
          conversation_id: conversationId,
          dress_id: dressFromGallery.id,
          request_summary: requestSummary,
          generated_prompt: prompt,
          status: "pending_review",
        })
        .select("id")
        .single();

      if (requestError) throw requestError;

      void sendPushNotification({
        type: "custom_request_submitted",
        sessionId: requestRow?.id,
        customerName:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.first_name ||
          session.user.email?.split("@")[0] ||
          "A customer",
      });

      setRequestSent(true);

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

  const dressAttributes = dressFromGallery
    ? [
        { label: "Neckline", value: dressFromGallery.neckline },
        { label: "Silhouette", value: dressFromGallery.silhouette },
        { label: "Fabric", value: dressFromGallery.fabric },
        { label: "Train", value: dressFromGallery.trainLength },
        { label: "Sleeves", value: dressFromGallery.sleeveStyle },
      ].filter((a) => a.value)
    : [];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <Header subtitle="Your Personal Bridal Consultant" />

      <div className="flex-1 min-h-0 flex">
        {/* Dress panel — left side, desktop only */}
        {dressFromGallery && (
          <div className="hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 border-r border-stone-200/50 dark:border-stone-700/50 bg-white/40 dark:bg-stone-800/40 overflow-hidden">
            <div className="relative flex-1 min-h-0">
              <img
                src={dressFromGallery.image}
                alt={dressFromGallery.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                <h3 className="font-serif text-white text-sm font-medium leading-snug">
                  {dressFromGallery.name}
                </h3>
                {dressFromGallery.collections.length > 0 && (
                  <p className="text-white/60 text-xs mt-0.5">
                    {dressFromGallery.collections[0]}
                  </p>
                )}
              </div>
            </div>
            {dressAttributes.length > 0 && (
              <div className="p-3 space-y-1.5 border-t border-stone-200/50 dark:border-stone-700/50 flex-shrink-0">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-medium mb-2">
                  Current Style
                </p>
                {dressAttributes.map((attr) => (
                  <div
                    key={attr.label}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <span className="text-stone-400 dark:text-stone-500 flex-shrink-0">
                      {attr.label}
                    </span>
                    <span className="text-stone-700 dark:text-stone-200 font-medium text-right truncate">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right side: chat + footer */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile dress strip */}
          {dressFromGallery && (
            <div className="md:hidden flex items-center gap-3 px-4 py-2 border-b border-stone-200/50 dark:border-stone-700/50 bg-white/40 dark:bg-stone-800/40 flex-shrink-0">
              <img
                src={dressFromGallery.image}
                alt={dressFromGallery.name}
                className="w-10 h-12 object-cover rounded-lg flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-serif text-stone-800 dark:text-stone-100 text-sm font-medium truncate">
                  {dressFromGallery.name}
                </p>
                {dressFromGallery.collections.length > 0 && (
                  <p className="text-stone-500 dark:text-stone-400 text-xs truncate">
                    {dressFromGallery.collections[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Chat area */}
          <div className="relative flex-1 min-h-0">
            <div
              className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10"
              style={{
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                maskImage:
                  "linear-gradient(to bottom, black 40%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 40%, transparent 100%)",
              }}
            />
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 px-6 py-3">
              <Sparkles className="w-4 h-4 text-stone-500 dark:text-stone-400" />
              <span className="font-serif text-stone-700 dark:text-stone-200">
                MAI
              </span>
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

                    {message.type === "bot" && message.options && message.questionId && (
                      <div className="flex flex-wrap gap-2 ml-0">
                        {message.options.map((option) => {
                          const isAnswered = answeredQuestions.has(message.questionId!);
                          const questionKey = questions.find(
                            (item) => item.id === message.questionId,
                          )?.key;
                          const isSelected =
                            isAnswered &&
                            questionKey &&
                            answers[questionKey] === option.value;
                          const dressAttr = dressFromGallery
                            ? getDressAttributeForQuestion(dressFromGallery, message.questionId!)
                            : "";
                          const isDressMatch = !isAnswered && isCurrentDressOption(option.value, dressAttr);

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handleOptionSelect(message.questionId!, option)
                              }
                              disabled={isAnswered}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                                isSelected
                                  ? "bg-gradient-to-r from-pink-200/60 to-stone-200 border-pink-300 text-stone-800 shadow-sm scale-[0.98]"
                                  : isAnswered
                                    ? "bg-white/40 dark:bg-stone-700/40 border-stone-200/30 dark:border-stone-600/30 text-stone-400 dark:text-stone-500 cursor-default"
                                    : isDressMatch
                                      ? "bg-stone-100/80 dark:bg-stone-700/80 border-stone-400 dark:border-stone-400 text-stone-700 dark:text-stone-200 hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 hover:shadow-sm cursor-pointer"
                                      : "bg-white/80 dark:bg-stone-700/80 border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 hover:shadow-sm cursor-pointer"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                              )}
                              {option.label}
                              {isDressMatch && (
                                <span className="text-[10px] text-stone-400 dark:text-stone-400 ml-0.5">
                                  · current
                                </span>
                              )}
                            </button>
                          );
                        })}
                        {!answeredQuestions.has(message.questionId) && (
                          <button
                            type="button"
                            onClick={() => handleSkipQuestion(message.questionId!)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 bg-white/80 dark:bg-stone-700/80 border-stone-200 dark:border-stone-600 text-stone-500 dark:text-stone-300 hover:border-stone-300 hover:bg-stone-50/50 dark:hover:bg-stone-700/90 hover:shadow-sm cursor-pointer"
                          >
                            Skip this option
                          </button>
                        )}
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
          </div>

          {/* Footer */}
          {isComplete && (
            <div className="border-t border-stone-200/50 dark:border-stone-700/50 p-6 bg-white/40 dark:bg-stone-800/40 space-y-4 flex-shrink-0">
              {!requestSent ? (
                <button
                  type="button"
                  onClick={handleRequestStyle}
                  disabled={isSending || !session?.user || selectedAnswerCount === 0}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-stone-700 via-pink-900/30 to-stone-700 dark:from-stone-800 dark:via-pink-900/40 dark:to-stone-800 text-white rounded-2xl font-serif text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <Sparkles className="w-5 h-5 text-pink-300" />
                  {isSending
                    ? "Sending for review..."
                    : "Request This Style from Our Designer"}
                  <ChevronRight className="w-5 h-5 text-pink-300" />
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl text-green-700 dark:text-green-300 font-medium">
                  <Check className="w-5 h-5" />
                  Request submitted for designer approval. Redirecting to chat...
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
                Your designer will review the request summary first. Once it is
                approved, they can generate a preview and continue the conversation
                in chat.
              </p>
              {selectedAnswerCount === 0 && (
                <p className="text-center text-xs text-amber-600 dark:text-amber-400">
                  Choose at least one customization option to submit your request.
                </p>
              )}
            </div>
          )}

          {!isComplete && (
            <div className="border-t border-stone-200/50 dark:border-stone-700/50 px-6 py-4 bg-white/30 dark:bg-stone-800/30 flex-shrink-0">
              <p className="text-center text-xs text-stone-400 dark:text-stone-500 flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Select an option above to continue •{" "}
                <span className="font-medium text-stone-500 dark:text-stone-400">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
