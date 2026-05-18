import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ chats, activeChat, onSelectChat, onNewChat, onDeleteChat }) {
  const { user, logout } = useAuth()
  const [hoveredChat, setHoveredChat] = useState(null)
  const [chatToDelete, setChatToDelete] = useState(null) // holds the chat pending deletion

  const handleDeleteClick = (e, chat) => {
    e.stopPropagation()
    setChatToDelete(chat) // open modal
  }

  const handleConfirmDelete = () => {
    onDeleteChat(chatToDelete.id)
    setChatToDelete(null) // close modal
  }

  const handleCancelDelete = () => {
    setChatToDelete(null) // close modal
  }

  return (
    <div className="w-64 h-screen bg-[#1c1a17] border-r border-[#3a3631] flex flex-col shrink-0 font-sans">

      {/* Header */}
      <div className="p-4 border-b border-[#3a3631]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-sm bg-[#c8642e] flex items-center justify-center">
            <span className="font-serif text-base font-bold text-[#f4f1ea]">L</span>
          </div>
          <div>
            <span className="font-serif text-[#f4f1ea] text-base">LLM Chat</span>
            <p className="text-[#8a8478] text-xs uppercase tracking-[0.15em]">AI Assistant</p>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-[#f4f1ea] hover:bg-[#c8642e] text-[#1c1a17] hover:text-[#f4f1ea] text-sm font-semibold px-3 py-2.5 rounded-sm transition-colors duration-200 uppercase tracking-wide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12 px-4 text-center">
            <div className="w-10 h-10 rounded-sm bg-[#2a2723] border border-[#3a3631] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#6a655c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-[#a8a298] text-xs">No chats yet</p>
            <p className="text-[#6a655c] text-xs mt-0.5">Start a new conversation</p>
          </div>
        ) : (
          <>
            <p className="text-[#6a655c] text-xs font-semibold px-3 py-1.5 uppercase tracking-[0.18em]">Recent</p>
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-sm cursor-pointer transition-colors duration-150 ${
                  activeChat?.id === chat.id
                    ? 'bg-[#2a2723] border-l-2 border-[#c8642e] text-[#f4f1ea]'
                    : 'text-[#a8a298] hover:bg-[#2a2723] hover:text-[#f4f1ea] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm truncate">{chat.title}</span>
                </div>

                {/* Delete button — opens modal instead of deleting directly */}
                {hoveredChat === chat.id && (
                  <button
                    onClick={e => handleDeleteClick(e, chat)}
                    className="shrink-0 p-1 rounded-sm text-[#6a655c] hover:text-[#d97757] hover:bg-[#c8642e]/10 transition-colors duration-150"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-[#3a3631]">
        <div className="flex items-center gap-2.5 p-2 rounded-sm hover:bg-[#2a2723] transition-colors group">
          <div className="w-8 h-8 rounded-sm bg-[#c8642e] flex items-center justify-center shrink-0">
            <span className="text-[#f4f1ea] text-xs font-serif font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#f4f1ea] font-medium truncate">{user?.username}</p>
            <p className="text-xs text-[#8a8478] truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="shrink-0 p-1.5 rounded-sm text-[#6a655c] hover:text-[#d97757] hover:bg-[#c8642e]/10 transition-colors duration-150"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {chatToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleCancelDelete} // clicking backdrop closes modal
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#1c1a17]/70 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative bg-[#f4f1ea] border border-[#d6d0c4] rounded-md p-7 w-full max-w-sm shadow-2xl shadow-black/40"
            onClick={e => e.stopPropagation()} // prevent backdrop click when clicking modal
          >
            {/* Label */}
            <p className="text-[#c8642e] text-xs font-semibold tracking-[0.2em] uppercase text-center mb-3">
              Confirm
            </p>

            {/* Text */}
            <h3 className="font-serif text-2xl text-[#1c1a17] text-center mb-2">
              Delete this chat?
            </h3>
            <p className="text-[#8a8478] text-sm text-center mb-1">
              You're about to remove
            </p>
            <p className="font-serif italic text-[#1c1a17] text-base text-center mb-5 truncate px-4">
              “{chatToDelete.title}”
            </p>

            <div className="border-t border-[#d6d0c4] pt-4 mb-5">
              <p className="text-[#a8a298] text-xs text-center">
                This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 border border-[#1c1a17] hover:bg-[#1c1a17] hover:text-[#f4f1ea] text-[#1c1a17] text-sm font-semibold py-2.5 rounded-sm transition-colors duration-150 uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-[#b3402a] hover:bg-[#8f3322] text-[#f4f1ea] text-sm font-semibold py-2.5 rounded-sm transition-colors duration-150 uppercase tracking-wide"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}