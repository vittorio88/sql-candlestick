## sql-candlestick

A simple browser-only JS App.  

 - sqlite3 db populated with sample data by the pip module yfinance is included.
 - Uses SQL.JS in WASM to avoid needing SQLITE3 as a C-based Build dependency.
 - Uses Apache Echart Candlestick Example as a template.
 - No React, Server-side processing, or building is necessary.
 - A table is also populated from the finance data.
 

### Install Dependencies
Nodejs must be installed for dependency installation 

```
npm install
```

### How to run
 - Host the application with your web-server of choice.  
 - Can use Python HTTP Module or Node for serving the web-page over HTTP, since it cannot be Opened as a file due to unfortunate modern-day browser CORS restrictions.  
 - VScode launcher files are also included to run Node HTTP Server.  

```
npm start
```

### Install and run start-up script
```
start-web-server-node-8080.sh
```
