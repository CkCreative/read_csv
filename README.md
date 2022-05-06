# Simple Node.js Portfolio Tracker

## Node version tested

- Node.js v16

## Usage

- Install Node.js
- Clone this repo
- Run `npm install`
- Runing
  - `npm run dev f=file_path.csv` to processes all transactions of the `file_path.csv`
  - `npm run dev f=file_path.csv token=XYZ` to process `XYZ` token transactions only, replace `XYZ` with desired coin
  - `npm run dev f=file_path.csv date=YYYY-MM-DD` OR `npm run dev date=YYYY/MM/DD` to process all transactions up to the given date
  - `npm run dev f=file_path.csv token=XYZ date=YYYY-MM-DD` to process transactions of a particular token up to the given date

  > Running the commands without providing the `f=filepath` argument will default to a file named `transactions.csv` in the root directory of the project.

## Design Decisions

- Since the transactions file can be very large, to conserve resources, a streaming approach (`readline`) was chosen over the normal `readFileSynch` or `readFile` which both would require an almost equal amount of memory as the file size.

- The functions for updating the portfolio are meant to be usable even if the transactions were coming from a network instead of the file system. Therefore, the `updatePorfolio` function takes a transaction and the current portfolio object and returns an updated portfolio object. Similarly, the `updateUsdValue` takes the portfolio object and calculates, for each token in portfolio, the current USD value then returns the updated portfolio object.

- Unit tests were written for each function to ascertain their behavior when their logic is updated. The tests were written before the functions were implemented so as to maintain a good interface.

- Axios is widely used in the JavaScript community for API calls and therefore the API calls in the project were made using axios.

## Results for the test data

```bash
BTC: TOTAL COINS = 1,200,425.152, USD VALUE = 43,687,384,673.387
ETH: TOTAL COINS = 901,704.283, USD VALUE = 2,471,382,082.146
XRP: TOTAL COINS = 903,332.981, USD VALUE = 548,594.12
TOTAL TRANSACTIONS:  30,000,000
duration: 46.546s
```
