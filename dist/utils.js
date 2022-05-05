"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsdValue = exports.updatePortfolio = exports.streamTransactionsFromFile = void 0;
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
    if (currentValue == undefined) {
        switch (transaction.transaction_type) {
            case "DEPOSIT":
                balance.tokens = transaction.amount;
                return balance;
            case "WITHDRAWAL":
                balance.tokens = 0 - transaction.amount;
                return balance;
            default:
                throw new Error("Illegal action");
        }
    }
    switch (transaction.transaction_type) {
        case "DEPOSIT":
            balance.tokens = currentValue.tokens + transaction.amount;
            return balance;
        case "WITHDRAWAL":
            balance.tokens = currentValue.tokens - transaction.amount;
            return balance;
        default:
            throw new Error("Illegal action");
    }
}
function updatePortfolio(transaction, portfolio) {
    portfolio[transaction.token] = calculateBalance(transaction, portfolio[transaction.token]);
    return portfolio;
}
exports.updatePortfolio = updatePortfolio;
async function updateUsdValue(portfolio) {
    const keys = Object.keys(portfolio);
    for (let key of keys) {
        const url = `https://min-api.cryptocompare.com/data/price?fsym=${key}&tsyms=USD`;
        const { data } = await axios_1.default.get(url);
        let { tokens } = portfolio[key];
        portfolio[key].usd_value = tokens * data["USD"];
    }
    return portfolio;
}
exports.updateUsdValue = updateUsdValue;
