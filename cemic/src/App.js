import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    const [urls, setUrls] = useState([
        { url: "http://cemicuat.mk313.com/", name: "UAT APP" },
        { url: "http://cemicuatapi.mk313.com/", name: "UAT API" },
        { url: "http://cemicqa.mk313.com/", name: "QA APP" },
        { url: "http://cemicqaapi.mk313.com/", name: "QA API" }
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
                                    <i className="fas fa-copy"></i>
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
