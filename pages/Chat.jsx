import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import MessageBubble from '../components/MessageBubble'
import api from '../api'

export default function Chat() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingChats, setLoadingChats] = useState(true)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  // When URL has a chatId and chats are loaded, open that chat
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const found = chats.find(c => c.id === chatId)
      if (found) handleSelectChat(found)
    }
  }, [chatId, chats])

  const loadChats = async () => {
    try {
      const res = await api.get('/chats/')
      setChats(res.data)
    } catch (err) {
      console.error('Failed to load chats', err)
    }
    setLoadingChats(false)
  }

  const handleSelectChat = async (chat) => {
    setActiveChat(chat)
    navigate(`/chat/${chat.id}`)
    try {
      const res = await api.get(`/chats/${chat.id}`)
      setMessages(res.data.messages)
    } catch (err) {
      console.error('Failed to load messages', err)
    }
  }

  const handleNewChat = async () => {
    try {
      const res = await api.post('/chats/', { title: 'New Chat' })
      setChats(prev => [res.data, ...prev])
      setActiveChat(res.data)
      setMessages([])
      navigate(`/chat/${res.data.id}`)
    } catch (err) {
      console.error('Failed to create chat', err)
    }
  }

  const handleDeleteChat = async (chatId) => {
    try {
      await api.delete(`/chats/${chatId}`)
      setChats(prev => prev.filter(c => c.id !== chatId))
      if (activeChat?.id === chatId) {
        setActiveChat(null)
        setMessages([])
        navigate('/')
      }
    } catch (err) {
      console.error('Failed to delete chat', err)
    }
  }

const handleSend = async () => {
  if (!input.trim() || !activeChat || loading) return

  const userMessage = { role: 'user', content: input, id: Date.now() }
  const currentInput = input
  setInput('')
  setLoading(true)

  // Update chat title from first message
  if (messages.length === 0) {
    const newTitle = currentInput.slice(0, 40)
    await api.patch(`/chats/${activeChat.id}`, { title: newTitle })
    setChats(prev => prev.map(c =>
      c.id === activeChat.id ? { ...c, title: newTitle } : c
    ))
  }

  const assistantMsgId = Date.now() + 1

  try {
    const token = localStorage.getItem('access_token')
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chats/${activeChat.id}/messages/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: currentInput })
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let streamStarted = false

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))

            if (data.token) {
              fullContent += data.token

              if (!streamStarted) {
                // First token — add user message AND assistant bubble together
                streamStarted = true
                setMessages(prev => {
                  const base = prev.filter(Boolean)
                  const hasUser = base.some(m => m.id === userMessage.id)
                  const withUser = hasUser ? base : [...base, userMessage]
                  return [...withUser, { role: 'assistant', content: fullContent, id: assistantMsgId }]
                })
              } else {
                // Subsequent tokens — update only assistant bubble
                setMessages(prev => prev.filter(Boolean).map(msg =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: fullContent }
                    : msg
                ))
              }
            }

            if (data.done) {
              setMessages(prev => prev.filter(Boolean).map(msg =>
                msg.id === assistantMsgId
                  ? { ...msg, content: fullContent }
                  : msg
              ))
            }

          } catch { }
        }
      }
    }

    // Final safety
    setMessages(prev => {
      const exists = prev.some(m => m?.id === assistantMsgId)
      if (!exists && fullContent) {
        return [...prev.filter(Boolean), userMessage, {
          role: 'assistant',
          content: fullContent,
          id: assistantMsgId
        }]
      }
      return prev.filter(Boolean).map(msg =>
        msg?.id === assistantMsgId
          ? { ...msg, content: fullContent }
          : msg
      )
    })

  } catch (err) {
    console.error('Streaming error:', err)
    setMessages(prev => [
      ...prev.filter(Boolean),
      userMessage,
      {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        id: assistantMsgId
      }
    ])
  }

  setLoading(false)
}
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-[#f4f1ea] font-sans">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#d6d0c4] bg-[#f4f1ea] flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-[#c8642e] flex items-center justify-center shrink-0">
                <span className="font-serif text-base font-bold text-[#f4f1ea]">L</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-[#1c1a17] text-base truncate">{activeChat.title}</h2>
                <p className="text-xs text-[#a8a298] uppercase tracking-[0.15em]">AI Assistant</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5a7d52]"></span>
                <span className="text-xs text-[#8a8478] uppercase tracking-wider">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-[#f4f1ea]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-sm bg-[#1c1a17] flex items-center justify-center mb-5">
                    <span className="font-serif text-2xl font-bold text-[#f4f1ea]">L</span>
                  </div>
                  <p className="text-[#c8642e] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
                    A blank page
                  </p>
                  <p className="font-serif text-2xl text-[#1c1a17]">Start the conversation.</p>
                  <p className="text-[#8a8478] text-sm mt-1.5">Ask anything — every word is kept.</p>
                </div>
              )}

              {messages.filter(Boolean).map((msg, i) => (
                <MessageBubble key={msg?.id || i} message={msg} />
              ))}

              {/* Typing indicator */}
              {loading && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-3 px-2">
                  <div className="w-8 h-8 rounded-sm bg-[#1c1a17] flex items-center justify-center text-xs text-[#f4f1ea] font-serif font-bold shrink-0">
                    AI
                  </div>
                  <div className="bg-[#ebe7dc] border border-[#d6d0c4] rounded-md px-4 py-3">
                    <div className="flex gap-1.5 items-center h-5">
                      <span className="w-1.5 h-1.5 bg-[#c8642e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#c8642e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#c8642e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-4 pb-4 pt-3 border-t border-[#d6d0c4] bg-[#f4f1ea]">
              <div className="max-w-3xl mx-auto">
                <div className="relative bg-[#ebe7dc] border border-[#d6d0c4] hover:border-[#c0b9a8] focus-within:border-[#c8642e] rounded-md transition-colors duration-200">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message AI Assistant..."
                    rows={1}
                    className="w-full bg-transparent px-4 pt-3.5 pb-3 pr-14 text-[#1c1a17] text-sm placeholder-[#a8a298] focus:outline-none resize-none leading-relaxed"
                    style={{ maxHeight: '160px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-2.5 bottom-2.5 bg-[#1c1a17] hover:bg-[#c8642e] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1c1a17] text-[#f4f1ea] p-2 rounded-sm transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <p className="text-center text-[#a8a298] text-xs mt-2.5">
                  Press <kbd className="bg-[#ebe7dc] border border-[#d6d0c4] text-[#8a8478] px-1.5 py-0.5 rounded-sm text-xs">Enter</kbd> to send · <kbd className="bg-[#ebe7dc] border border-[#d6d0c4] text-[#8a8478] px-1.5 py-0.5 rounded-sm text-xs">Shift+Enter</kbd> for new line
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Welcome screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden bg-[#f4f1ea]">

            {/* Faint grid texture */}
            <div
              className="absolute inset-0 opacity-[0.5] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(#d6d0c4 1px, transparent 1px), linear-gradient(90deg, #d6d0c4 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-sm bg-[#1c1a17] flex items-center justify-center mb-7 mx-auto">
                <span className="font-serif text-4xl font-bold text-[#f4f1ea]">L</span>
              </div>
              <p className="text-[#c8642e] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                LLM Chat
              </p>
              <h2 className="font-serif text-4xl text-[#1c1a17] mb-3 tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-[#8a8478] mb-9 text-sm">
                Select a chat from the sidebar, or begin a new thread.
              </p>
              <button
                onClick={handleNewChat}
                className="bg-[#1c1a17] hover:bg-[#c8642e] text-[#f4f1ea] font-semibold px-8 py-3.5 rounded-sm transition-colors duration-200 text-sm uppercase tracking-wide"
              >
                Start new chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}