import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import { AppType } from './AppType';
import { useDebounce } from './useDebounce';

const tagStyles = {};
const getTagStyle = (tag) => {
    if (!tagStyles[tag]) {
        // Assign consistent color based on tag hash
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Generate background color
        const colorInt = Math.abs(hash % 0xFFFFFF);
        const bgColor = '#' + colorInt.toString(16).padStart(6, '0');

        // Determine if background is dark
        const r = (colorInt >> 16) & 0xFF;
        const g = (colorInt >> 8) & 0xFF;
        const b = colorInt & 0xFF;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

        const textColor = luminance > 186 ? '#000000' : '#FFFFFF';

        tagStyles[tag] = {
            backgroundColor: bgColor,
            color: textColor
        };
    }
    return tagStyles[tag];
};

const Sidebar = ({ urls, isOpen }) => {
    // Filter URLs to show only AppType.APP items
    const filteredUrls = urls.filter(item => item.AppType === AppType.APP);

    // State for search inputs
    const [searchInput, setSearchInput] = useState('');
    const [tagsSearchInput, setTagsSearchInput] = useState('');
    const debouncedSearchInput = useDebounce(searchInput, 300);
    const debouncedTagsSearchInput = useDebounce(tagsSearchInput, 300);

    // State for selected tags and filtered URLs
    const [selectedTags, setSelectedTags] = useState([]);
    const [filteredUrlsState, setFilteredUrlsState] = useState(filteredUrls);

    // Function to extract tags from item.name
    const getTagsFromName = (name) => name.split(' ');

    // Collect all unique tags
    const allTags = Array.from(new Set(
        filteredUrls.flatMap(item => getTagsFromName(item.name))
    ));

    // Handle tag selection
    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    useEffect(() => {
        // Filter URLs based on search inputs and selected tags
        let filtered = filteredUrls;

        if (debouncedSearchInput) {
            const query = debouncedSearchInput.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(query)
            );
        }

        if (selectedTags.length > 0) {
            filtered = filtered.filter(item => {
                const itemTags = getTagsFromName(item.name);
                return selectedTags.every(tag => itemTags.includes(tag));
            });
        }

        setFilteredUrlsState(filtered);
    }, [debouncedSearchInput, selectedTags, filteredUrls]);

    // Filter tags based on tags search input
    const displayedTags = allTags.filter(tag =>
        tag.toLowerCase().includes(debouncedTagsSearchInput.toLowerCase())
    );

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <input
                type="search"
                className="search-input"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search URLs"
            />
            <input
                type="search"
                className="tag-search-input"
                placeholder="Search tags..."
                value={tagsSearchInput}
                onChange={(e) => setTagsSearchInput(e.target.value)}
                aria-label="Search Tags"
            />
            <div className="tags-list">
                {displayedTags.map(tag => (
                    <span
                        key={tag}
                        className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                        style={getTagStyle(tag)}
                        onClick={() => handleTagClick(tag)}
                    >
                        {tag}
                        {selectedTags.includes(tag) && (
                            <FontAwesomeIcon
                                icon={faTimes}
                                className="tag-close-icon"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent parent onClick from triggering
                                    handleTagClick(tag);
                                }}
                            />
                        )}
                    </span>
                ))}
            </div>
            <ul className="list-group">
                {filteredUrlsState.map(item => (
                    <li key={item.url} className="list-group-item">
                        <div className="api-item">
                            <FontAwesomeIcon icon={faFileAlt} className="file-icon" />
                            <a href={`#${item.url}`}>
                                {getTagsFromName(item.name).map(tag => (
                                    <span
                                        key={tag}
                                        className="tag"
                                        style={getTagStyle(tag)}
                                        onClick={() => handleTagClick(tag)}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;