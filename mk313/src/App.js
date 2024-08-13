import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import Dexie from 'dexie';

// Initialize Dexie database
const db = new Dexie('TodoDatabase');
db.version(1).stores({
    todos: '++id, text'
});

function App() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        // Load todos from IndexedDB on component mount
        const loadTodos = async () => {
            const allTodos = await db.todos.toArray();
            setTodos(allTodos);
        };
        loadTodos();
    }, []);

    const addTodo = async () => {
        if (input.trim() !== '') {
            const newTodo = { text: input.trim() };
            const id = await db.todos.add(newTodo);
            setTodos(prevTodos => [...prevTodos, { ...newTodo, id }]);
            setInput('');
            inputRef.current.focus(); // Set focus back to input field
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            addTodo();
        }
    };

    const removeTodo = async (idToRemove) => {
        await db.todos.delete(idToRemove);
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== idToRemove));
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
                    aria-label="To-Do Input" // Accessibility improvement
                />
                <button className="btn btn-primary mt-2" onClick={addTodo}>
                    Add To-Do
                </button>
            </div>

            {todos.map((todo) => (
                <div key={todo.id} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <span>{todo.text}</span>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeTodo(todo.id)} aria-label={`Remove ${todo.text}`}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default App;
