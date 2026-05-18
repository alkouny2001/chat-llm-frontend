import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false)

  // ✅ Guard first — before ANY property access
  if (!message || !message.role) return null
  if (message.role === 'assistant' && !message.content) return null

  const isUser = message.role === 'user'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`flex gap-3 px-2 ${isUser ? 'justify-end' : 'justify-start'}`}>

      {/* AI Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-sm bg-[#1c1a17] flex items-center justify-center text-xs text-[#f4f1ea] font-serif font-bold shrink-0">
          AI
        </div>
      )}

      {/* Bubble */}
      <div className={`group relative max-w-[78%] ${
        isUser
          ? 'bg-[#1c1a17] text-[#f4f1ea] rounded-md rounded-tr-sm'
          : 'bg-[#ebe7dc] border border-[#d6d0c4] text-[#1c1a17] rounded-md rounded-tl-sm'
      } px-4 py-3`}>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-sm bg-[#f4f1ea] border border-[#d6d0c4] hover:border-[#c8642e] text-[#8a8478] hover:text-[#c8642e] shadow-md"
          title="Copy message"
        >
          {copied ? (
            <svg className="w-3 h-3 text-[#5a7d52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className={`prose prose-sm max-w-none ${
          isUser
            ? '[&_*]:text-[#f4f1ea] [&_code]:bg-[#f4f1ea]/15 [&_code]:text-[#f4f1ea] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm [&_a]:text-[#e8a87c] [&_a]:underline [&_pre]:bg-[#0f0e0c] [&_pre]:border [&_pre]:border-[#3a3631] [&_pre]:rounded-sm'
            : '[&_*]:text-[#1c1a17] [&_code]:bg-[#1c1a17]/[0.07] [&_code]:text-[#9f4a1f] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm [&_a]:text-[#c8642e] [&_a]:underline [&_pre]:bg-[#1c1a17] [&_pre]:border [&_pre]:border-[#3a3631] [&_pre]:rounded-sm [&_pre_*]:text-[#f4f1ea] [&_blockquote]:border-l-2 [&_blockquote]:border-[#c8642e] [&_blockquote]:text-[#5a564e]'
        }`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-sm bg-[#c8642e] flex items-center justify-center text-xs text-[#f4f1ea] font-serif font-bold shrink-0">
          You
        </div>
      )}
    </div>
  )
}