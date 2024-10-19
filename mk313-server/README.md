
# mk313 Server

This is a simple Express.js server for managing Todo items.

## Prerequisites

- Node.js installed
- MongoDB running locally or remotely
- PM2 installed globally for process management

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Ensure MongoDB is running. You can update the MongoDB connection string in `server.js` if needed.

## Running the Application

### Development

To start the server in development mode, simply run:
```bash
node server.js
```

The server will start at `http://localhost:3010`.

### Production with PM2

For production, use [PM2](https://pm2.keymetrics.io/) to manage the application. PM2 allows you to easily manage your Node.js application with features like load balancing and automatic restarts if the application crashes.

#### Install PM2:
If you haven't installed PM2 globally yet, you can do so with:
```bash
npm install pm2 -g
```

#### Start the server with PM2:
```bash
pm2 start server.js --name mk313-server
```

This command starts your application and assigns it the name `mk313-server`.

#### Useful PM2 Commands:
- View running processes:
  ```bash
  pm2 list
  ```
- View detailed logs:
  ```bash
  pm2 logs mk313-server
  ```
- Restart the server:
  ```bash
  pm2 restart mk313-server
  ```
- Stop the server:
  ```bash
  pm2 stop mk313-server
  ```
- Delete the server from PM2:
  ```bash
  pm2 delete mk313-server
  ```

#### Auto-start on server reboot:
To ensure the application starts automatically after a system reboot, run:
```bash
pm2 startup
pm2 save
```

## API Endpoints

- `GET /api/todos` - Retrieve all todos
- `POST /api/todos` - Add a new todo
- `DELETE /api/todos/:id` - Delete a todo by its ID

For detailed examples of how to interact with these API endpoints, refer to the code in `server.js`.
