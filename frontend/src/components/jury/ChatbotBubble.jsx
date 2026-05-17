export default function ChatbotBubble({ open, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? 'Fermer le chatbot jury' : 'Ouvrir le chatbot jury'}
      className="grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-2xl text-white shadow-lg transition hover:bg-indigo-500"
    >
      {open ? '×' : '💬'}
    </button>
  )
}
