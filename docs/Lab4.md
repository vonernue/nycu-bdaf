# Lab 4 Readme
## Run Test
1. Compile the contract
```bash
yarn hardhat compile
```
2. Test the contract
```bash
yarn hardhat test test/Lab4.js
```

## Security Risk of `takeFeeAsOwner()`
The owner will be able to drain the vault by calling `takeFeeAsOwner()` and take all the tokens in the vault. 
The demostration of this attack can be found in the test case `Should drain vault by owner` in `test/Lab4.js`.