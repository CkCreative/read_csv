"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
console.time("execution");
const args = process.argv.slice(2);
let startDate = 0;
let token = "";
let file_path = "";
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
const filepath = file_path ? file_path : "./transactions.csv";
let portfolio = {};
const transactions = (0, utils_1.streamTransactionsFromFile)(filepath);
let currentLine = 0;
transactions.on("line", (line) => {
    let values = line.split(",");
    if (values.length != 4 || values[0] == "timestamp" || line == "")
        return;
    currentLine++;
    if (token != "" && values[2] != token)
        return;
    if (+values[0] <= startDate || startDate == 0) {
        let transaction = {
            timestamp: +values[0],
            transaction_type: values[1],
            token: values[2],
            amount: +values[3],
        };
        portfolio = (0, utils_1.updatePortfolio)(transaction, portfolio);
    }
});
transactions.on("close", async () => {
    portfolio = await (0, utils_1.updateUsdValue)(portfolio);
    const tokens = Object.keys(portfolio);
    for (token of tokens) {
        console.log(`${token}: TOTAL COINS = ${portfolio[token].tokens.toLocaleString()}, USD VALUE = ${portfolio[token].usd_value.toLocaleString()}`);
    }
    console.log("TOTAL TRANSACTIONS: ", currentLine.toLocaleString());
    console.timeEnd("execution");
});
