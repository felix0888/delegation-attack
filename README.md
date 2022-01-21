# Delegation Attack

Smart Contract Security Practice | Lv6 Delegation Attack

```
!!! DON'T TRY ON MAINNET !!!
```

## Summary
The goal of this level is for you to claim ownership of the instance you are given.

#### Things might help:
- Look into Solidity's documentation on the delegatecall low level function, how it works, how it can be used to delegate operations to on-chain libraries, and what implications it has on execution scope.
- Fallback methods
- Method ids

#### What you will learn:
- Low level calls in Solidity
- `call` vs `delegatecall` vs `staticcall`
- How to get/use function signature?
- What is `fallback`

## Smart Contract Code
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Delegate {

  address public owner;

  constructor(address _owner) public {
    owner = _owner;
  }

  function pwn() public {
    owner = msg.sender;
  }
}

contract Delegation {

  address public owner;
  Delegate delegate;

  constructor(address _delegateAddress) public {
    delegate = Delegate(_delegateAddress);
    owner = msg.sender;
  }

  fallback() external {
    (bool result,) = address(delegate).delegatecall(msg.data);
    if (result) {
      this;
    }
  }
}
```

## Solidity Concepts
#### Transaction
#### Low level calls & Function Signature
#### `delegatecall` vs `call` vs `staticcall`
#### `fallback` methods

## Security Risk
#### What security risk it has?

#### How to fix it?

## Deploy & Test
#### Installation
#### Deployment
#### Test
