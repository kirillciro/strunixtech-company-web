export default function MessagesPage() {
  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-sm">
      {/* Temporary static conversation used to shape the chat layout before sockets and persistence are added. */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        <div className="bg-gray-200 p-2 rounded-xl w-fit">
          Hello, how can we help?
        </div>

        <div className="bg-blue-600 text-white p-2 rounded-xl w-fit ml-auto">
          I want a website
        </div>
      </div>

      {/* Input row is presentational only right now. */}
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Type message..."
        />
        <button className="px-4 bg-blue-600 text-white rounded-xl">Send</button>
      </div>
    </div>
  );
}
