import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function App() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    const addTodo = () => {
        if (input.trim() !== '') {
            setTodos(prevTodos => [...prevTodos, input.trim()]);
            setInput('');
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            addTodo();
        }
    };

    const removeTodo = (indexToRemove) => {
        setTodos(prevTodos => prevTodos.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="container mt-5">
            <div className="d-flex flex-column justify-content-center align-items-center mb-4">
                <h1>
                    <a href="http://mk313.com/" className="text-decoration-none" rel="noopener noreferrer">
                        <span className="text-primary">MK313</span>
                    </a>
                </h1>
                {/*<a href="http://cemic.mk313.com/" className="text-decoration-none mt-2" target="_blank" rel="noopener noreferrer">*/}
                {/*    <span className="text-primary">Link to: CeMIC URLs</span> <FontAwesomeIcon icon={faExternalLinkAlt} />*/}
                {/*</a>*/}
            </div>

            <h2 className="mt-4 mb-2">To-Do List</h2>
            <div className="mb-4">
                <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    type="text"
                    className="form-control"
                    placeholder="Enter to-do item..."
                />
                <button className="btn btn-primary mt-2" onClick={addTodo}>
                    Add To-Do
                </button>
            </div>

            {todos.map((todo, index) => (
                <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <span>{todo}</span>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeTodo(index)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default App;
