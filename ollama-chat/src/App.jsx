import { useState } from 'react'
import './App.css'

function App() {
  const [apiUrl, setApiUrl] = useState('http://localhost:11434')
  const [modelId, setModelId] = useState('llama2')
  const [apiKey, setApiKey] = useState('')
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(true)

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage = { role: 'user', content: inputMessage.trim() }
    const updatedMessages = [...messages, newMessage]
    
    setMessages(updatedMessages)
    setInputMessage('')
    setIsLoading(true)
    setError('')

    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      // Add authorization header if API key is provided
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: modelId,
          messages: updatedMessages,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.message && data.message.content) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.message.content }])
      } else {
        throw new Error('Invalid response format from Ollama')
      }
    } catch (err) {
      setError(`Error: ${err.message}. Please check your API URL, model ID, and ensure Ollama is running.`)
      console.error('Error sending message:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🦙 Ollama Chat</h1>
        <button 
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-group">
            <label htmlFor="apiUrl">Ollama API URL:</label>
            <input
              id="apiUrl"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:11434"
            />
          </div>

          <div className="settings-group">
            <label htmlFor="modelId">Model ID:</label>
            <input
              id="modelId"
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="llama2"
            />
          </div>

          <div className="settings-group">
            <label htmlFor="apiKey">API Key (optional):</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key if required"
            />
          </div>

          <div className="settings-info">
            <p>💡 Make sure Ollama is running locally. Default port is 11434.</p>
          </div>
        </div>
      )}

      <main className="chat-container">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        <div className="messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h2>Welcome to Ollama Chat!</h2>
              <p>Configure your Ollama settings above and start chatting with your local AI model.</p>
              <p>Popular models: llama2, mistral, codellama, phi, gemma</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🦙'}
                </div>
                <div className="message-content">
                  <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong>
                  <p>{message.content}</p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">🦙</div>
              <div className="message-content">
                <strong>Assistant:</strong>
                <div className="loading">Thinking...</div>
              </div>
            </div>
          )}
        </div>

        <div className="input-area">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here... (Press Enter to send)"
            disabled={isLoading}
            rows="3"
          />
          <div className="input-buttons">
            <button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              className="send-button"
            >
              Send
            </button>
            <button 
              onClick={clearChat} 
              disabled={isLoading || messages.length === 0}
              className="clear-button"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
