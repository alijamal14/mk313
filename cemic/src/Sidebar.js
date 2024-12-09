import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faFolder, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = ({ urls, isOpen }) => {
    // Group URLs by groupId
    const groupedUrls = urls.reduce((groups, item) => {
        if (!groups[item.groupId]) {
            groups[item.groupId] = [];
        }
        groups[item.groupId].push(item);
        return groups;
    }, {});

    // State to manage collapsed groups
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const toggleGroup = (groupId) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <ul className="list-group">
                {Object.keys(groupedUrls).map(groupId => {
                    const groupItems = groupedUrls[groupId];

                    return (
                        <li key={groupId} className="list-group-item">
                            <div className="group-header" onClick={() => toggleGroup(groupId)}>
                                <FontAwesomeIcon
                                    icon={collapsedGroups[groupId] ? faChevronDown : faChevronRight}
                                    className="chevron-icon"
                                />
                                <FontAwesomeIcon icon={faFolder} className="folder-icon" />
                                <span className="group-name">{groupId}</span>
                            </div>
                            {collapsedGroups[groupId] && (
                                <ul className="api-list">
                                    {groupItems.map(item => (
                                        <li key={item.url} className="api-item">
                                            <FontAwesomeIcon icon={faFileAlt} className="file-icon" />
                                            <a href={`#${item.url}`}>
                                                {item.name} ({item.AppType})
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Sidebar;