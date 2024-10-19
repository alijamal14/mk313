import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
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

    // Function to check if the server is online
    const isServerOnline = async () => {
        try {
            const response = await fetch('https://your-server.com/api/todos', { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('Server is offline:', error);
            return false;
        }
    };

    useEffect(() => {
        // Load todos from IndexedDB on component mount
        const loadTodos = async () => {
            const allTodos = await db.todos.toArray();
            setTodos(allTodos);
        };
        loadTodos();

        // Sync with server when online
        const syncWithServer = async () => {
            if (navigator.onLine) {
                const serverOnline = await isServerOnline();
                if (serverOnline) {
                    try {
                        // Fetch todos from server and update local database
                        const response = await fetch('https://your-server.com/api/todos');
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const serverTodos = await response.json();
                        await db.todos.clear();
                        await db.todos.bulkAdd(serverTodos);
                        setTodos(serverTodos);
                    } catch (error) {
                        console.error('Failed to fetch:', error);
                    }
                }
            }
        };

        // Add event listeners for online and offline events
        window.addEventListener('online', syncWithServer);
        window.addEventListener('offline', () => console.log('Offline'));

        // Initial sync with server
        syncWithServer();

        // Cleanup event listeners on component unmount
        return () => {
            window.removeEventListener('online', syncWithServer);
            window.removeEventListener('offline', () => console.log('Offline'));
        };
    }, []);

    const addTodo = async () => {
        if (input.trim() !== '') {
            const newTodo = { text: input.trim() };
            const id = await db.todos.add(newTodo);
            setTodos(prevTodos => [...prevTodos, { ...newTodo, id }]);
            setInput('');
            inputRef.current.focus(); // Set focus back to input field

            // Sync with server
            if (navigator.onLine) {
                const serverOnline = await isServerOnline();
                if (serverOnline) {
                    await fetch('https://your-server.com/api/todos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newTodo)
                    });
                }
            }
        }
    };

    const removeTodo = async (idToRemove) => {
        await db.todos.delete(idToRemove);
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== idToRemove));

        // Sync with server
        if (navigator.onLine) {
            const serverOnline = await isServerOnline();
            if (serverOnline) {
                await fetch(`https://your-server.com/api/todos/${idToRemove}`, {
                    method: 'DELETE'
                });
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            addTodo();
        }
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
                    onKeyDown={handleKeyDown}
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
