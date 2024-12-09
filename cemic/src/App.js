import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faCopy, faChevronDown, faChevronUp, faBars } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import packageJson from '../package.json'; // Import the package.json
import Sidebar from './Sidebar'; // Import the Sidebar component

const AppType = {
    APP: "Application",
    API: "API"
};

const urlsData = [
    { url: "https://fpsoraia.smartchecksheets.com", name: "Fpsoraia (Smartchecksheets)", AppType: AppType.APP, groupId: "Smartchecksheets-Fpsoraia" },
    { url: "https://uaru.smartchecksheets.com", name: "UARU APP (Smartchecksheets)", AppType: AppType.APP, groupId: "Smartchecksheets-UARU" },
    { url: "https://uat.smartchecksheets.com/", name: "UAT UARU APP (Smartchecksheets)", AppType: AppType.APP, groupId: "Smartchecksheets-UARU-UAT" },
    { url: "https://uatapi.smartchecksheets.com/", name: "UAT UARU API (Smartchecksheets)", AppType: AppType.API, groupId: "Smartchecksheets-UARU-UAT" },
    { url: "https://cemicqa.mk313.com", name: "QA APP (mk313)", AppType: AppType.APP, groupId: "mk313-QA", directIP: "http://182.180.62.223:3004/" },
    { url: "https://cemicqaapi.mk313.com", name: "QA API (mk313)", AppType: AppType.API, groupId: "mk313-QA", directIP: "http://182.180.62.223:3003/" },
    { url: "https://cemicuat.mk313.com", name: "UAT RAIA APP (mk313)", AppType: AppType.APP, groupId: "mk313-UAT-RAIA" },
    { url: "https://cemicuatapi.mk313.com", name: "UAT RAIA API (mk313)", AppType: AppType.API, groupId: "mk313-UAT-RAIA" },
    { url: "https://cemic_uat_uaru_app.mk313.com/", name: "UAT UARU APP (mk313)", AppType: AppType.APP, groupId: "mk313-UAT-UARU" },
    { url: "https://cemic_uat_uaru_api.mk313.com/", name: "UAT UARU API (mk313)", AppType: AppType.API, groupId: "mk313-UAT-UARU" },
    { url: "https://CeMIC_eni_app.mk313.com", name: "Eni APP (mk313)", AppType: AppType.APP, groupId: "mk313-OLD-ENI" },
    { url: "https://CeMIC_eni_api.mk313.com", name: "ENI API (mk313)", AppType: AppType.API, groupId: "mk313-OLD-ENI" },
];

const copyURL = (url) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard");
};

const App = () => {
    const [urls] = useState(urlsData);
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleGroupCollapse = (groupId) => {
        setCollapsedGroups(prevState => ({
            ...prevState,
            [groupId]: !prevState[groupId]
        }));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const highlightElement = () => {
        // Remove highlight from any previously highlighted elements
        const previouslyHighlighted = document.querySelector('.highlight');
        if (previouslyHighlighted) {
            previouslyHighlighted.classList.remove('highlight');
        }

        // Highlight the current element
        const hash = window.location.hash.substring(1);
        if (hash) {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                element.classList.add('highlight');
            }
        }
    };

    useEffect(() => {
        highlightElement(); // Highlight on initial render

        window.addEventListener('hashchange', highlightElement); // Listen for hash changes

        return () => {
            window.removeEventListener('hashchange', highlightElement); // Cleanup listener on unmount
        };
    }, []);

    return (
        <div className="container mt-5 d-flex">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faBars} />
            </button>
            <Sidebar urls={urls} isOpen={isSidebarOpen} /> {/* Add the Sidebar component */}
            <div className={`content ml-4 ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <a href="http://cemic.mk313.com/" className="text-decoration-none">
                    <h1 className="text-center mb-4 text-primary">CeMIC URLs</h1>
                </a>
                <a href="https://stats.uptimerobot.com/697oyuV1v3" className="text-decoration-none mt-2" target="_blank" rel="noopener noreferrer">
                    <span className="text-primary">CeMIC UpTime Monitor</span> <FontAwesomeIcon icon={faExternalLinkAlt} />
                </a>
                <ul className="list-group mt-3">
                    {urls.filter(item => item.AppType === AppType.APP).map(appItem => (
                        <li id={appItem.url} key={appItem.url} className="list-group-item mb-3 p-3 shadow-sm rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h4>{appItem.name} ({appItem.AppType})</h4>
                                <a href={appItem.url} className="btn btn-primary btn-sm visit-btn">Visit</a>
                            </div>
                            <div className="input-group mb-2">
                                <input value={appItem.url} type="text" className="form-control touch-friendly-input" readOnly />
                                <div className="input-group-append">
                                    <button onClick={() => copyURL(appItem.url)} className="btn btn-outline-secondary">
                                        <FontAwesomeIcon icon={faCopy} />
                                    </button>
                                </div>
                            </div>
                            {appItem.directIP && (
                                <div className="input-group mb-2">
                                    <input value={appItem.directIP} type="text" className="form-control touch-friendly-input" readOnly />
                                    <div className="input-group-append">
                                        <button onClick={() => copyURL(appItem.directIP)} className="btn btn-outline-secondary">
                                            <FontAwesomeIcon icon={faCopy} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="collapse-btn" onClick={() => toggleGroupCollapse(appItem.groupId)}>
                                <span>{collapsedGroups[appItem.groupId] ? 'Hide APIs' : 'Show APIs'}</span>
                                <FontAwesomeIcon icon={collapsedGroups[appItem.groupId] ? faChevronUp : faChevronDown} />
                            </div>
                            {collapsedGroups[appItem.groupId] && urls.filter(item => item.groupId === appItem.groupId && item.AppType === AppType.API).map(apiItem => (
                                <div key={apiItem.url} className="list-group-item list-group-item-secondary mt-2 p-3 rounded">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5>{apiItem.name} ({apiItem.AppType})</h5>
                                        <a href={apiItem.url} className="btn btn-secondary btn-sm visit-btn">Visit</a>
                                    </div>
                                    <div className="input-group">
                                        <input value={apiItem.url} type="text" className="form-control touch-friendly-input" readOnly />
                                        <div className="input-group-append">
                                            <button onClick={() => copyURL(apiItem.url)} className="btn btn-outline-secondary">
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>
                                        </div>
                                    </div>
                                    {apiItem.directIP && (
                                        <div className="input-group mt-2">
                                            <input value={apiItem.directIP} type="text" className="form-control touch-friendly-input" readOnly />
                                            <div className="input-group-append">
                                                <button onClick={() => copyURL(apiItem.directIP)} className="btn btn-outline-secondary">
                                                    <FontAwesomeIcon icon={faCopy} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </li>
                    ))}
                </ul>
                <footer className="text-center mt-5">
                    <p>Version: {packageJson.version}</p>
                </footer>
            </div>
        </div>
    );
};

export default App;