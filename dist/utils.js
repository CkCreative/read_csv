"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgs = exports.updateUsdValue = exports.updatePortfolio = exports.streamTransactionsFromFile = void 0;
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
function streamTransactionsFromFile(filepath) {
    const readInterface = readline_1.default.createInterface({
        input: fs_1.default.createReadStream(filepath),
    });
    return readInterface;
}
exports.streamTransactionsFromFile = streamTransactionsFromFile;
function calculateBalance(transaction, currentValue) {
    const balance = {
        tokens: currentValue?.tokens ? currentValue?.tokens : 0,
        usd_value: 0,
    };
    // where the transaction belongs to a token which has
    // not been captured in the portfolio summary yet
    if (currentValue == undefined) {
        switch (transaction.transaction_type) {
            case "DEPOSIT":
                balance.tokens = transaction.amount;
                return balance;
            case "WITHDRAWAL":
                balance.tokens = 0 - transaction.amount;
                return balance;
            default:
                throw new Error("Unknown transaction type");
        }
    }
    // where a transaction is already in the portfolio summary
    switch (transaction.transaction_type) {
        case "DEPOSIT":
            balance.tokens = currentValue.tokens + transaction.amount;
            return balance;
        case "WITHDRAWAL":
            balance.tokens = currentValue.tokens - transaction.amount;
            return balance;
        default:
            throw new Error("Unknown transaction type");
    }
}
function updatePortfolio(transaction, portfolio) {
    // effect changes to portfolio summary as received
    // from each transaction
    portfolio[transaction.token] = calculateBalance(transaction, portfolio[transaction.token]);
    return portfolio;
}
exports.updatePortfolio = updatePortfolio;
async function updateUsdValue(portfolio) {
    // for all the tokens in the porfolio
    const keys = Object.keys(portfolio);
    for (let key of keys) {
        // query the usd value of the token and calculate the equivalent
        // usd value of all the coins of the token
        const url = `https://min-api.cryptocompare.com/data/price?fsym=${key}&tsyms=USD`;
        const { data } = await axios_1.default.get(url);
        let { tokens } = portfolio[key];
        portfolio[key].usd_value = tokens * data["USD"];
    }
    return portfolio;
}
exports.updateUsdValue = updateUsdValue;
function getArgs() {
    const args = process.argv.slice(2);
    let startDate = 0;
    let token = "";
    let file_path = "";
    for (let arg of args) {
        const values = arg.split("=");
        switch (values[0].toLocaleLowerCase()) {
            case "token":
                token = values[1];
                break;
            case "f":
                file_path = values[1];
                break;
            case "date":
                startDate = Date.parse(values[1]) / 1000;
                break;
            default:
                break;
        }
    }
    return { token, file_path, startDate };
}
exports.getArgs = getArgs;
