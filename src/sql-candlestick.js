import * as databaseUtils from './databaseUtils.js';
import * as EchartCandlestick from './EchartCandlestick.js';
const PathToSqlJsWorker = "../node_modules/sql.js/dist/worker.sql-wasm.js";
const localDbFilePath = '../data/yfinance_data.sqlite3';
const sqlQuery = "SELECT * FROM price_data_AAPL LIMIT 20"; // Select only the top 20 rows


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function handleDatabaseResults(results) {
  console.log("database results are: ")
  console.log(results)
  createTable(results); 
  EchartCandlestick.updateResults(results);
  
}

function createTable(data) {
  // Create a table element
  let table = document.createElement('table');
  let thead = table.createTHead();
  let tbody = table.createTBody();
  let headRow = thead.insertRow();

  // Assuming the first row of data contains the column headers
  data[0].columns.forEach(headerText => {
    let header = document.createElement('th');
    let textNode = document.createTextNode(headerText);
    header.appendChild(textNode);
    headRow.appendChild(header);
  });

  // Fill the table with data
  data[0].values.forEach(rowData => {
    let row = tbody.insertRow();
    rowData.forEach(cellData => {
      let cell = row.insertCell();
      let textContent = typeof cellData === 'number' ? cellData.toFixed(2) : cellData;
      let textNode = document.createTextNode(textContent);
      cell.appendChild(textNode);
    });
  });

  // Append the table to the document body or a specific element
  document.body.appendChild(table);
}

// Load the database from the local file and run the query
databaseUtils.initWorker(PathToSqlJsWorker);
databaseUtils.tellWorkerToOpenFile(localDbFilePath);
databaseUtils.registerWorkerEventCallback(handleDatabaseResults);
databaseUtils.pollDatabaseStatus(50, 10)  // Poll every 1000ms, up to 10 times
    .then(() => {
        databaseUtils.execSqlCommand(sqlQuery, handleDatabaseResults);
    })
    .catch(error => {
        console.error("Error waiting for the database:", error);
    });

