import {
  streamTransactionsFromFile,
  PortfolioSummary,
  updatePortfolio,
  Transaction,
  updateUsdValue,
} from "./utils";

console.time("execution"); // track execution time

const args = process.argv.slice(2); // skip the first two args

let startDate = 0;
let token = "";
let file_path = "";

// iterate through all commandline args and initialize
// variables as necessary
for (let arg of args) {
  const values = arg.split("=");
  if (values[0].toLocaleLowerCase() == "token") {
    token = values[1];
  }
  if (values[0].toLocaleLowerCase() == "f") {
    file_path = values[1];
  }
  if (values[0].toLocaleLowerCase() == "date") {
    startDate = Date.parse(values[1]) / 1000;
  }
}

// default file if none is provided
const filepath = file_path ? file_path : "./transactions.csv";

let portfolio: PortfolioSummary = {};

// initialize transactions stream from file
const transactions = streamTransactionsFromFile(filepath);

let currentLine = 0;

// listen for new lines which are transactions
// and carry out the necessary processing

transactions.on("line", (line: any) => {
  let values = line.split(","); // get values from a line of csv

  // guard against empty values and heading
  if (values.length != 4 || values[0] == "timestamp" || line == "") return;

  currentLine++; // count transactions

  if (token != "" && values[2] != token) return; // skip other tokens when a token is provided

  // for any transaction within the specified time
  if (+values[0] <= startDate || startDate == 0) {
    let transaction: Transaction = {
      timestamp: +values[0],
      transaction_type: values[1],
      token: values[2],
      amount: +values[3],
    };

    // update porfolio
    portfolio = updatePortfolio(transaction, portfolio);
  }
});

// when the file is closed
transactions.on("close", async () => {
  // get the usd value of the porfolio summary
  portfolio = await updateUsdValue(portfolio);

  // for each portfolio item
  const tokens = Object.keys(portfolio);
  for (token of tokens) {
    // print a summary to the console
    console.log(
      `${token}: TOTAL COINS = ${portfolio[
        token
      ].tokens.toLocaleString()}, USD VALUE = ${portfolio[
        token
      ].usd_value.toLocaleString()}`
    );
  }

  // end
  console.log("TOTAL TRANSACTIONS: ", currentLine.toLocaleString());
  console.timeEnd("execution");
});
