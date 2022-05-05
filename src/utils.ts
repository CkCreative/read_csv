import readline from "readline";
import fs from "fs";
import axios from "axios";

export type Transaction = {
  timestamp: number;
  token: string;
  transaction_type: string;
  amount: number;
};

type PortfolioItem = {
  tokens: number;
  usd_value: number;
};

export type PortfolioSummary = {
  [key: string]: PortfolioItem;
};

export function streamTransactionsFromFile(filepath: string) {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(filepath),
  });

  return readInterface;
}

function calculateBalance(
  transaction: Transaction,
  currentValue: PortfolioItem | undefined
): PortfolioItem {
  const balance: PortfolioItem = {
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

export function updatePortfolio(
  transaction: Transaction,
  portfolio: PortfolioSummary
) {
  // effect changes to portfolio summary as received
  // from each transaction
  portfolio[transaction.token] = calculateBalance(
    transaction,
    portfolio[transaction.token]
  );

  return portfolio;
}

export async function updateUsdValue(portfolio: PortfolioSummary) {
  // for all the tokens in the porfolio
  const keys = Object.keys(portfolio);

  for (let key of keys) {
    // query the usd value of the token and calculate the equivalent
    // usd value of all the coins of the token
    const url = `https://min-api.cryptocompare.com/data/price?fsym=${key}&tsyms=USD`;
    const { data } = await axios.get(url);
    let { tokens } = portfolio[key];

    portfolio[key].usd_value = tokens * data["USD"];
  }
  return portfolio;
}
