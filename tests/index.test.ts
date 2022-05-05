import { Interface } from "readline";
import {
  streamTransactionsFromFile,
  updatePortfolio,
  updateUsdValue,
  PortfolioSummary,
  Transaction,
} from "../src/utils";

let portfolio: PortfolioSummary = {
  BTC: {
    tokens: 100,
    usd_value: 0,
  },
};

const transactionOne: Transaction = {
  timestamp: Date.now(),
  token: "BTC",
  transaction_type: "DEPOSIT",
  amount: 50,
};

const transactionTwo: Transaction = {
  timestamp: Date.now(),
  token: "BTC",
  transaction_type: "WITHDRAWAL",
  amount: 10,
};

describe("streamTransactionsFromFile", () => {
  it("Should read and instantiate a stream from given file", () => {
    const filepath = "./test.csv";
    const transactions = streamTransactionsFromFile(filepath);
    expect(transactions).toBeInstanceOf(Interface);
  });
});

describe("updatePortfolio", () => {
  it("Should take a transaction and update the portfolio", async () => {
    portfolio = await updatePortfolio(transactionOne, portfolio);
    portfolio = await updatePortfolio(transactionTwo, portfolio);

    expect(portfolio["BTC"].tokens).toBe(140);
  });
});

describe("updateUsdValue", () => {
  it("Should take existing portfolio and calculate USD value of each token", async () => {
    portfolio = await updateUsdValue(portfolio);

    expect(portfolio["BTC"].usd_value).toBeGreaterThan(0);
  });
});
