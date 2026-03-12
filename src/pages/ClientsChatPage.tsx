import { Sparkles, MessageCircle, Search } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import Header from "../components/common/Header"

interface Conversation {
  id: string
  clientName: string
  clientImage?: string
  lastMessage: string
  timestamp: string
  unread: boolean
  isOnline: boolean
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    clientName: "Emma Johnson",
    lastMessage: "Thank you so much! I loved the collection you showed me 💕",
    timestamp: "2 min ago",
    unread: true,
    isOnline: true,
  },
  {
    id: "2",
    clientName: "Sophia Martinez",
    lastMessage: "Can we schedule a fitting for next week?",
    timestamp: "15 min ago",
    unread: true,
    isOnline: true,
  },
  {
    id: "3",
    clientName: "Olivia Williams",
    lastMessage: "I need help choosing between the two dresses",
    timestamp: "1 hour ago",
    unread: false,
    isOnline: false,
  },
  {
    id: "4",
    clientName: "Ava Brown",
    lastMessage: "The dress fits perfectly! When can I pick it up?",
    timestamp: "3 hours ago",
    unread: false,
    isOnline: false,
  },
  {
    id: "5",
    clientName: "Isabella Davis",
    lastMessage: "Do you have this in size 12?",
    timestamp: "Yesterday",
    unread: false,
    isOnline: false,
  },
]

export default function ClientsChatPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations] = useState<Conversation[]>(mockConversations)

  const filteredConversations = conversations.filter((conv) =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const unreadCount = conversations.filter((conv) => conv.unread).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
      <Header subtitle="Client Chats" />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-3xl text-stone-800">
                Client Chats
              </h2>
              <p className="text-stone-500 mt-1">
                {unreadCount > 0
                  ? `${unreadCount} unread conversation${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>

            <div className="w-14 h-14 bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 rounded-full flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-stone-600" />
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/60 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200/50 focus:border-pink-300/50 text-stone-800 placeholder:text-stone-400"
            />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
          {filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No conversations found</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200/50">
              {filteredConversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  to="/chat"
                  state={{ client: conversation }}
                  className="flex items-center gap-4 p-5 hover:bg-stone-50/50 transition-colors group"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-stone-200 via-pink-100/30 to-stone-300 flex items-center justify-center border-2 border-stone-200/30">
                      {conversation.clientImage ? (
                        <img
                          src={conversation.clientImage}
                          alt={conversation.clientName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-serif text-stone-600">
                          {conversation.clientName.charAt(0)}
                        </span>
                      )}
                    </div>

                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-serif text-lg text-stone-800 group-hover:text-stone-900 transition-colors">
                        {conversation.clientName}
                      </h3>
                      <span className="text-xs text-stone-400 flex-shrink-0 ml-2">
                        {conversation.timestamp}
                      </span>
                    </div>

                    <p
                      className={`text-sm truncate ${
                        conversation.unread
                          ? "text-stone-800 font-medium"
                          : "text-stone-500"
                      }`}
                    >
                      {conversation.lastMessage}
                    </p>
                  </div>

                  {conversation.unread && (
                    <div className="w-3 h-3 bg-pink-400 rounded-full flex-shrink-0"></div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-amber-200/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-stone-700">
                <strong>Preview Mode:</strong> Select a client to open their chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}