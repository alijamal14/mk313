
# mk313-server

This is a simple to-do list server application built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running

## Getting Started

### Running the Server in Development Mode

1. **Clone the repository**:
   Clone the repository to your local machine using the following command:
   ```bash
   git clone https://github.com/yourusername/mk313-server.git
   cd mk313-server
   ```
   This will download the project files to a folder named `mk313-server` and navigate into it.

2. **Install dependencies**:
   Install the required dependencies using npm:
   ```bash
   npm install
   ```
   This command installs all the necessary dependencies defined in the `package.json` file.

3. **Start MongoDB**:
   Make sure MongoDB is running on your machine. You can start it using the following command:
   ```bash
   mongod
   ```
   This will start the MongoDB server. If you're unsure how to check whether MongoDB is running, you can verify using `mongo` command or by checking your service manager.

4. **Run the server**:
   Start the Node.js server using the following command:
   ```bash
   node server.js
   ```
   The server will start on `http://localhost:3001`. You can now use this address to interact with the server locally.

### API Endpoints

- `GET /api/todos`: Fetch all to-do items.
- `POST /api/todos`: Add a new to-do item. The request body should contain the new item's details in JSON format.
- `DELETE /api/todos/:id`: Delete a to-do item by ID. Ensure the ID in the request URL matches the item's ID.

Example for adding a new todo using curl:
```bash
curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"task": "New Task"}'
```

### Common Errors and Troubleshooting

- **MongoDB connection issues**: Ensure MongoDB is running by checking your service manager or running `mongo` in your terminal to confirm connection.
- **Port conflicts**: If you encounter issues with port `3001`, you can change the port in `server.js` by modifying the `port` variable.

## Deploying to IIS

To deploy the Node.js application to IIS, follow these steps:

1. **Install IIS and URL Rewrite Module**:
    - Open the Control Panel and go to "Programs" > "Programs and Features" > "Turn Windows features on or off".
    - Check "Internet Information Services" and click "OK".
    - Download and install the [URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite).

2. **Install `iisnode`**:
    - Download and install [iisnode](https://github.com/tjanczuk/iisnode).

3. **Configure IIS**:
    - Open IIS Manager.
    - Right-click on "Sites" and select "Add Website".
    - Set the "Site name" to `mk313-server`, "Physical path" to the directory where your project is located, and "Port" to `80` (or any other port you prefer).
    - Click "OK".

4. **Configure `web.config`**:
    Create a `web.config` file in the root of your project directory with the following content:
    ```xml
    <configuration>
        <system.webServer>
            <handlers>
                <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
            </handlers>
            <rewrite>
                <rules>
                    <rule name="DynamicContent">
                        <match url="/*" />
                        <action type="Rewrite" url="server.js" />
                    </rule>
                </rules>
            </rewrite>
        </system.webServer>
    </configuration>
    ```

5. **Start the Application**:
    - Open a browser and navigate to `http://localhost` (or the port you configured).
    - Your Node.js application should be running on IIS.

## License

This project is licensed under the MIT License.
