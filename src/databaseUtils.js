const DATABASE_STATUS = {
    busy: 'busy',
    notLoaded: 'not loaded',
    ready: 'ready',
    runningCommand: 'running command'
};

let databaseStatus = DATABASE_STATUS.busy;
let worker = null;

export function sleep(ms) {
    console.log("sleeping for: " + ms + "ms while waiting for db to be ready.")
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function initWorker(PathToSqlJsWorker)
{
    if (databaseStatus === DATABASE_STATUS.ready)
    {
        console.error("Database Worker already initialized.")
        return
    }

    console.log("Initializing worker.sql-wasm.js" + "located at: " + PathToSqlJsWorker);
    worker = new Worker(PathToSqlJsWorker);
    console.log("Initialization of worker.sql-wasm.js completed.");

    // Set up an event handler for messages from the worker
    worker.onmessage = event => {
        if (databaseStatus === DATABASE_STATUS.notLoaded) {
        // The first message indicates that the database has been opened
        console.log("[SQL.JS worker] Database Engine started .");
        databaseStatus = DATABASE_STATUS.ready;
        } else {
            console.error("[SQL.JS worker] Attempting to init Database Engine More than once. databaseStatus is: ")
            console.error(databaseStatus)
        }
    };
    
    // Set up an error handler
    worker.onerror = error => {
        console.error('There was an error in the worker: ', error);        
    };

    // set database to ready for queries
    databaseStatus = DATABASE_STATUS.ready;

}

export function tellWorkerToOpenFile(filePath, callback) {
    if (databaseStatus === DATABASE_STATUS.busy)
    {
        console.error("Returning from function due to error.")
        return;
    }
    databaseStatus = DATABASE_STATUS.busy;

    console.log('Fetching data from database file at path:', filePath);

    fetch(filePath)
    .then(response => {
        if (!response.ok) {
          // If the response is not 2xx, throw an error.
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.arrayBuffer();  // Convert the response body to an ArrayBuffer
      })
    .then(data => {
        worker.postMessage({
            action: 'open',
            buffer: new Uint8Array(data)
        });
    })
    .then(() => {
        databaseStatus = DATABASE_STATUS.ready;
        if (callback) callback();
    })
    .catch(error => {
        console.error('Failed to fetch or load database file:', error);
        databaseStatus = DATABASE_STATUS.notLoaded;
    });

}

export function registerWorkerEventCallback(handleResults) {
    // Update the event handler for messages from the worker
    worker.onmessage = event => {
        // Check if there's an error in the message data
        if (event.data.error) {
            console.error("Error received from worker: ", event.data.error);
            return;  // Stop further processing
        }

        // If there's no error, proceed to handle the results
        if (event.data.results) {
            console.log("Received data from worker: ", event.data.results);
            handleResults(event.data.results);
        } else {
            console.log("unknown message received from worker: ")
            console.log(event)
        }
    };
}


export function execSqlCommand(command) {
    if (databaseStatus === DATABASE_STATUS.busy || databaseStatus === DATABASE_STATUS.runningCommand)
    {
        console.error("Returning from function due to error.")
        return;
    }
    databaseStatus = DATABASE_STATUS.runningCommand;

    // run sql command sent to the worker
    console.log(`Running sql: ${command}`);
    worker.postMessage({
        action: 'exec',
        sql: command
    });

    databaseStatus = DATABASE_STATUS.ready;

}


export function openDataFile(buf) {
    if (databaseStatus === DATABASE_STATUS.busy || databaseStatus === DATABASE_STATUS.runningCommand){
        console.error("Returning from function due to error.")
        return;
    }
    databaseStatus = DATABASE_STATUS.runningCommand;

    console.log(`Opening File buffer`);

    worker.postMessage({
        id:1,
        action:"open",
        buffer:buf, /*Optional. An ArrayBuffer representing an SQLite Database file*/
    });
  
  
}
  
  function closeDatabase() {
    if (databaseStatus === DATABASE_STATUS.busy || databaseStatus === DATABASE_STATUS.runningCommand)
        console.error("Returning from function due to error.")
        return;

    databaseStatus = DATABASE_STATUS.busy;

    worker.postMessage({
        action: 'close'
    });
}

export function pollDatabaseStatus(interval, maxAttempts) {
    return new Promise(async (resolve, reject) => {

        let attempts = 0;
        while (databaseStatus !== DATABASE_STATUS.ready && attempts < maxAttempts) {
            await sleep(interval);
            attempts++;
        }
        if (databaseStatus === DATABASE_STATUS.ready) {
            resolve();
        } else {
            reject(new Error('Database did not become ready in time'));
        }
    });
}
