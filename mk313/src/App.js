import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Dexie from 'dexie';

// Initialize Dexie database
const db = new Dexie('TodoDatabase');
db.version(1).stores({
    todos: '_id, text, synced' // Add synced flag for two-way sync
});

function App() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    const isServerOnline = async () => {
        try {
            const response = await fetch('http://localhost:3010/api/todos', { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('Server is offline:', error);
            return false;
        }
    };

    const loadTodosFromLocal = async () => {
        const allTodos = await db.todos.toArray();
        setTodos(allTodos);
    };

    // Function to sync local unsynced todos to the server
    const syncLocalTodos = async () => {
        const unsyncedTodos = await db.todos.where('synced').equals(0).toArray(); // Get unsynced items

        for (const todo of unsyncedTodos) {
            const response = await fetch('http://localhost:3010/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: todo.text })
            });

            if (response.ok) {
                const serverTodo = await response.json();
                await db.todos.update(todo._id, { _id: serverTodo._id, synced: 1 }); // Mark as synced
            }
        }
    };

    // Sync both ways (push unsynced items and fetch new ones)
    const syncWithServer = async () => {
        if (navigator.onLine) {
            const serverOnline = await isServerOnline();
            if (serverOnline) {
                try {
                    // Push unsynced items to the server
                    await syncLocalTodos();

                    // Fetch new todos from the server
                    const response = await fetch('http://localhost:3010/api/todos');
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const serverTodos = await response.json();

                    // Clear local DB and sync with server todos
                    await db.todos.clear();
                    for (const todo of serverTodos) {
                        await db.todos.put({ ...todo, synced: 1 }); // Mark as synced
                    }

                    setTodos(serverTodos);
                } catch (error) {
                    console.error('Failed to fetch:', error);
                }
            }
        }
    };

    useEffect(() => {
        // Load todos from IndexedDB
        loadTodosFromLocal();

        // Sync when the app is online
        window.addEventListener('online', syncWithServer);

        // Initial sync with the server
        syncWithServer();

        // Clean up event listener
        return () => {
            window.removeEventListener('online', syncWithServer);
        };
    }, []);

    const addTodo = async () => {
        if (input.trim() !== '') {
            const newTodo = { text: input.trim(), synced: 0 }; // Unsynced by default
            const id = await db.todos.add(newTodo);
            setTodos(prevTodos => [...prevTodos, { ...newTodo, _id: id }]);
            setInput('');
            inputRef.current.focus();

            // Try syncing if online
            if (navigator.onLine) {
                const serverOnline = await isServerOnline();
                if (serverOnline) {
                    await syncLocalTodos(); // Push local changes
                }
            }
        }
    };
    const removeTodo = async (idToRemove) => {
        console.log('Removing todo with id:', idToRemove);
        if (idToRemove !== undefined) {
            await db.todos.delete(idToRemove);
            setTodos(prevTodos => prevTodos.filter(todo => todo._id !== idToRemove));

            if (navigator.onLine) {
                const serverOnline = await isServerOnline();
                if (serverOnline) {
                    await fetch(`http://localhost:3010/api/todos/${idToRemove}`, {
                        method: 'DELETE'
                    });
                }
            }
        } else {
            console.error('Invalid id:', idToRemove);
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
                <div key={todo._id} className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <span>{todo.text}</span>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => removeTodo(todo._id)} aria-label={`Remove ${todo.text}`}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default App;
