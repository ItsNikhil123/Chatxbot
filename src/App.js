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
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Replace HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Fix common formatting issues
      .replace(/\\n/g, '\n')
      .replace(/\\""/g, '\n')
      .replace(/\\"/g, '\n')
      .replace(/\\|\s*\n\s*/g, '\n')
      // Remove multiple spaces
      .replace(/\s{2,}/g, ' ')
      // Trim leading/trailing whitespace
      .trim();
  };

  const getResponse = async () => {
    if (!value) {
      setError("Error!, Please ask a question!");
      return;
    }
    try {
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
      const response = await fetch('http://localhost:8000/gemini', options);
      const data = await response.text()
      const output = formatServerResponse(data)
      console.log(output);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      getResponse();
    }
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
            onKeyPress={handleKeyPress}
            className="chat-input"
          />
          
          <div className="button-container">
            {!error ? (
              <button className="send-button" onClick={getResponse}>
                <svg width="24px" height="24px" viewBox="0 -3 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.78271 16.6242L12.2227 26.9454L28.0848 6.67813V4.80151L17.8604 9.58687L8.78271 16.6242Z" fill="white" />
                  <path d="M12.2227 26.9454L28.0848 12.0734V4.80151L22.3515 12.6833L13.3693 18.5008L12.2227 26.9454Z" fill="white" />
                  <path d="M1.9044 11.45C0.611678 11.9303 0.628604 13.7646 1.92996 14.221L8.78229 16.6241L28.0844 4.80145L13.369 18.5008L25.6405 27.7826C26.5064 28.4375 27.7593 27.9626 27.9734 26.8981L32.9143 2.32681C33.1417 1.19533 32.0388 0.253539 30.9569 0.655507L1.9044 11.45Z" fill="red" />
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