
# mk313-server

This is a simple to-do list server application built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running

## Getting Started

### Running the Server as a Developer

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/mk313-server.git
    cd mk313-server
    ```
2. **Install dependencies**:
    ```bash
    npm install
    ```
3. **Start MongoDB**:
    Make sure MongoDB is running. You can start it using the following command:
    ```bash
    mongod
    ```
4. **Run the server**:
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:3001`.

### API Endpoints

- `GET /api/todos`: Fetch all to-do items.
- `POST /api/todos`: Add a new to-do item.
- `DELETE /api/todos/:id`: Delete a to-do item by ID.

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
