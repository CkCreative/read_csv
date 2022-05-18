# Crypto Portfolio Tracker

## Node version tested

- Node.js v16

## Sample data

```csv
timestamp,transaction_type,token,amount
1571967208,WITHDRAWAL,BTC,10
1571967205,DEPOSIT,BTC,10
1571967200,DEPOSIT,BTC,5
```

## Usage

- Install Node.js
- Clone this repo
- Run `npm install`
- Runing
  - `npm run dev f=file_path.csv` to processes all transactions of the `file_path.csv`
  - `npm run dev f=file_path.csv token=XYZ` to process `XYZ` token transactions only, replace `XYZ` with desired coin
  - `npm run dev f=file_path.csv date=YYYY-MM-DD` OR `... date=YYYY/MM/DD` to process all transactions up to the given date
  - `npm run dev f=file_path.csv token=XYZ date=YYYY-MM-DD` to process transactions of a particular token up to the given date

  > Running the commands without providing the `f=filepath` argument will default to a file named `test.csv` in the root directory of the project.
  > The date should be formatted according to *ISO 8601*, that is: YYYY-MM-DD or YYYY/MM/DD

## Design Decisions

- Since the transactions file can be very large, to conserve resources, a streaming approach (`readline`) was chosen over the normal `readFileSynch` or `readFile` which both would require an almost equal amount of memory as the file size.

- The functions for updating the portfolio are meant to be usable even if the transactions were coming from a network instead of the file system. Therefore, the `updatePorfolio` function takes a transaction and the current portfolio object and returns an updated portfolio object. Similarly, the `updateUsdValue` takes the portfolio object and calculates, for each token in portfolio, the current USD value then returns the updated portfolio object.

- Axios is widely used in the JavaScript community for API calls and therefore the API calls in the project were made using axios.

## Results for the test data

```bash
> read_csv@0.0.1 dev
> tsc && node ./dist/index.js

BTC: TOTAL COINS = 5, USD VALUE = 148,803.75
TOTAL TRANSACTIONS:  3
duration: 1.127s
```

The code was tested on `Intel(R) Core(TM) i5-6300U CPU @ 2.40GHz`
