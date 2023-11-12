import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';




function App() {
    const [urls] = useState([
        { url: "https://uaru.smartchecksheets.com", name: "UARU APP" },
        { url: "https://cemicuat.mk313.com", name: "UAT APP" },
        { url: "https://cemicuatapi.mk313.com", name: "UAT API" },
        { url: "https://cemicqa.mk313.com", name: "QA APP" },
        { url: "https://cemicqaapi.mk313.com", name: "QA API" }
    ]);

    const copyURL = (url) => {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert('URL copied to clipboard!');
    };

    return (    
        <div className="container mt-5">
            <a href="http://cemic.mk313.com/" className="text-decoration-none">
                <h1 className="text-center mb-4 text-primary">CeMIC URLs</h1>
            </a>
            <a href="https://stats.uptimerobot.com/697oyuV1v3" className="text-decoration-none mt-2" target="_blank" rel="noopener noreferrer">
                <span className="text-primary">CeMIC UpTime Monitor</span> <FontAwesomeIcon icon={faExternalLinkAlt} />
            </a>
            <ul className="list-group">
                {urls.map(item => (
                    <li key={item.url} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h4>{item.name}</h4>
                            <a href={item.url} className="btn btn-primary btn-sm">Visit</a>
                        </div>
                        <div className="input-group">
                            <input value={item.url} type="text" className="form-control" readOnly />
                            <div className="input-group-append">
                                <button onClick={() => copyURL(item.url)} className="btn btn-outline-secondary">
                                    <FontAwesomeIcon icon={faCopy} />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
