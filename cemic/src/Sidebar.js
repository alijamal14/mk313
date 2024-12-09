import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faFolder, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};

const Sidebar = ({ urls, isOpen }) => {
    // Group URLs by groupId
    const groupedUrls = urls.reduce((groups, item) => {
        if (!groups[item.groupId]) {
            groups[item.groupId] = [];
        }
        groups[item.groupId].push(item);
        return groups;
    }, {});

    // States to manage collapsed groups and search
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearchInput = useDebounce(searchInput, 300);
    const [filteredUrls, setFilteredUrls] = useState(groupedUrls);

    const toggleGroup = (groupId) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    // Effect to filter URLs based on debounced search input
    useEffect(() => {
        if (!debouncedSearchInput) {
            setFilteredUrls(groupedUrls);
            return;
        }

        const lowercasedQuery = debouncedSearchInput.toLowerCase();
        const filtered = Object.keys(groupedUrls).reduce((result, groupId) => {
            const filteredItems = groupedUrls[groupId].filter(item =>
                item.name.toLowerCase().includes(lowercasedQuery)
            );
            if (filteredItems.length > 0) {
                result[groupId] = filteredItems;
            }
            return result;
        }, {});
        setFilteredUrls(filtered);
    }, [debouncedSearchInput, groupedUrls]);

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <input
                type="search" // Changed from "text" to "search"
                className="search-input"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search URLs" // Accessibility improvement
            />
            <ul className="list-group">
                {Object.keys(filteredUrls).map(groupId => {
                    const groupItems = filteredUrls[groupId];

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