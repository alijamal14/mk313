import React from 'react';
import './Sidebar.css';

const Sidebar = ({ urls, isOpen }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <ul className="list-group">
                {urls.map((item, index) => (
                    <li key={index} className="list-group-item">
                        <a href={`#${item.url}`}>{item.name}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;