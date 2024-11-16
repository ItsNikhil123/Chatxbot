import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./index.css";

function App() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const surprizeOptions = [
    'Who is the president of india?',
    'Where does the butter chicken came from?',
    'How do we make a veg sandwich?',
    'when is christmas'
  ];

  const surprise = () => {
    const randomnum = surprizeOptions[Math.floor(Math.random() * surprizeOptions.length)];
    setValue(randomnum);
  };

  const formatServerResponse = (data) => {
    if (!data) return '';
  
    // Handle different data types
    const stringResponse = typeof response === 'string' 
      ? data 
      : JSON.stringify(data);
  
    return stringResponse
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\\n/g, '\n')
      .replace(/\\""/g, '\n')
      .replace(/\\"/g, '\n')
      .replace(/\\|\s*\n\s*/g, '\n')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  const getResponse = async () => {
    if (!value) {
      setError("Error!, Please ask a question!");
      return;
    }
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://your-netlify-site.netlify.app';
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: value
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const response = await fetch(`${API_URL}/api/gemini`, options);
      const data = await response.text();
      const output = formatServerResponse(data);
      setChatHistory(oldChatHistory => [
        ...oldChatHistory,
        {
          role: "user",
          parts: value
        },
        {
          role: "model",
          parts: output
        }
      ]);
      setValue("");
    } catch (error) {
      console.error(error);
      setError("Something went wrong! Please try again later. ");
    }
  };

  const clear = () => {
    setValue("");
    setError("");
    setChatHistory([]);
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Chatxbot</h1>
          <button className="surprise-btn" onClick={surprise} disabled={!chatHistory}>
            Surprise Me
          </button>
        </div>

        <div className="chat-messages">
          {chatHistory.map((chatItem, _index) => (
            <div key={_index} className={`message-wrapper ${chatItem.role === 'user' ? 'user-message' : 'assistant-message'}`}>
              <div className="message-content">
                <div className="message-header">
                  {chatItem.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="message-body">
                  <ReactMarkdown>{chatItem.parts}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="input-container">
          <textarea
            value={value}
            placeholder="Type something!"
            onChange={(e) => setValue(e.target.value)}
            className="chat-input"
          />
          
          <div className="button-container">
            {!error ? (
              <button className="send-button" onClick={getResponse}>
                <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.45284 2.71266C7.8276 1.76244 9.1724 1.76245 9.54716 2.71267L10.7085 5.65732C10.8229 5.94743 11.0526 6.17707 11.3427 6.29148L14.2873 7.45284C15.2376 7.8276 15.2376 9.1724 14.2873 9.54716L11.3427 10.7085C11.0526 10.8229 10.8229 11.0526 10.7085 11.3427L9.54716 14.2873C9.1724 15.2376 7.8276 15.2376 7.45284 14.2873L6.29148 11.3427C6.17707 11.0526 5.94743 10.8229 5.65732 10.7085L2.71266 9.54716C1.76244 9.1724 1.76245 7.8276 2.71267 7.45284L5.65732 6.29148C5.94743 6.17707 6.17707 5.94743 6.29148 5.65732L7.45284 2.71266Z" fill="#1C274C"/>
                  <path d="M16.9245 13.3916C17.1305 12.8695 17.8695 12.8695 18.0755 13.3916L18.9761 15.6753C19.039 15.8348 19.1652 15.961 19.3247 16.0239L21.6084 16.9245C22.1305 17.1305 22.1305 17.8695 21.6084 18.0755L19.3247 18.9761C19.1652 19.039 19.039 19.1652 18.9761 19.3247L18.0755 21.6084C17.8695 22.1305 17.1305 22.1305 16.9245 21.6084L16.0239 19.3247C15.961 19.1652 15.8348 19.039 15.6753 18.9761L13.3916 18.0755C12.8695 17.8695 12.8695 17.1305 13.3916 16.9245L15.6753 16.0239C15.8348 15.961 15.961 15.8348 16.0239 15.6753L16.9245 13.3916Z" fill="#1C274C"/>
                </svg>
              </button>
            ) : (
              <button className="clear-button" onClick={clear}>Clear</button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default App;