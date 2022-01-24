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
An Ethereum transaction refers to an action initiated by an externally-owned account, in other words an account managed by a human, not a contract.
![what-is-Ethereum-Transaction-768x457](https://user-images.githubusercontent.com/45418310/150748171-8d314b38-bcf6-429e-8876-0951a22b2935.png)

An internal transaction is the consequence of smart contract logic that is triggered by an external transaction - the transaction transmitted from the EOA to the smart contract.

#### Low level calls & Function Signature
solidity has the `call` funciton on `address` data type which can be used to call public and external functions on contracts. It can also be used to transfer ether to addresses.

`call` is not recommended in most situations for contract function calls because it bypasses type checking, function existence check, and argument packing. It is preferred to import the interface of the contract to call functions on it.
`call` is used to call the `fallback` and `receive` functions on the contract. `receive` is called when no data is sent in the function call and ether is sent. `fallback` function is called when no function signature matches the call.
`call` consumes less gas than calling the function on the contract instance. So in some cases `call` is preferred for gas optimization.

Solidity has 2 more low level functions `delegatecall` and `staticcall`. `staticcall` is exactly the same as `call` with only difference that it cannot modify state of the contract being called.

**Function signature** also known as **method id** is the first 4 bytes of hash of the function signature.
To use `call` you need to send encoded data as the param. The data will have the function signature and params encoded together.

```solidity
// ContractToBeCalled.sol
contract ContractToBeCalled {
    uint stateVar;
    
    function feedValue(uint _value) public returns (uint) {
        stateVar = _value;
        return stateVar;
    }
}

// MyContract.sol
...
bytes memory feedValueSignature = abi.encodeWithSignature("feedValue(uint)");
(bool success, bytes memory retData) = address(addrCTBC).call(feedValueSignature, 10);
require(success);
...
```

The first return boolean value represents the success or failure status of the call and the second one(`retData` on the above example) is the bytes array that represents the return values of the contract function called(`feedValue()`).
We can get the return value of the function called by using abi.decode().
```solidity
(uint stateVar) = abi.decode(retData, (uint));
```

For more details, please refer the [Units and Globally Available Variables / Members of Address Types](https://docs.soliditylang.org/en/v0.8.11/units-and-global-variables.html#address-related).

#### `delegatecall` vs `call(staticcall)`
Unlike `call`, `delegatecall` preserve context.
`delegatecall` preserves current calling contract's context (storage, msg.sender, msg.value). The calling contract using `delegatecall` allows the called contract to mutate its state.

1. Context in `call`
![1_PwYIsFyDM60IW4KuDkUncA](https://user-images.githubusercontent.com/45418310/150762555-cbca7a1b-06ba-4cc8-9ef7-4750147c4837.png)

2. Context in `delegatecall`
![1_4OB3IwTF1AkW6zH3tJv8Tw](https://user-images.githubusercontent.com/45418310/150762584-a069c1e9-0658-4760-bc7d-bd8d73380b72.png)

3. How storage works in `delegatecall`?
![1_i2illD1nDsdULcEH5qVnmg](https://user-images.githubusercontent.com/45418310/150762718-eb2a9ef3-38cf-40f8-a67e-b7353ab53c14.jpg)
In `delegatecall`, storage of two contracts are mapped by storage slot and the contract being called can change the storage of the previous contract.

**DELEGATECALL basically says that I'm a contract and I'm allowing (delegating) you to do whatever you want to my storage.** DELEGATECALL is a security risk for the sending contract which needs to trust that the receiving contract will treat the storage well.

#### `fallback` functions
`fallback` function is a special function available to a contract. It has following features −
- It is called when a non-existent function is called on the contract.
- It is required to be marked external.
- It has no name.
- It has no arguments
- It can not return any thing.
- It can be defined one per contract.
- If not marked payable, it will throw exception if contract receives plain ether without data.

In Solidity there is `receive` payable function which is executed on calls to the contract with no data(`calldata`), e.g. calls made via `send` or `transfer`.
`receive` unction cannot have arguments, cannot return anything and must have `external` visibility and `payable` state mutability.

## Security Risk
#### What security risk it has?
You might be able to see `fallback` method in `Delegation` contract interacts with `Delegate` contract by using `delegatecall` low level feature.
On the `DelegationAttack` contract, it tries to call `pwn` function of `Delegation` contract which doesn't exist. It leads to be fall into the `fallback`.
```solidity
(bool result,) = address(delegate).delegatecall(msg.data);
```
This will directly interact with `Delegate` contract with `msg.data` which encorded data of `pwn()` function signature and parameter(no parameter here). Finally the `pwn` of `Delegate` contract is called.
You've already seen how storage works in `delegatecall` and `owner` state variable in `Delegate` contract is mapped to the `owner` in the `Delegation` contract.
So `owner = msg.sender;` in `pwn` function actually changes the `owner` of the `Delegation` contract.

#### Security Consideration
> **!!! WARNING**: You should avoid using .call() whenever possible when executing another contract function as it bypasses type checking, function existence check, and argument packing.

> **!!! WARNING**: There are some dangers in using send: The transfer fails if the call stack depth is at 1024 (this can always be forced by the caller) and it also fails if the recipient runs out of gas. So in order to make safe Ether transfers, always check the return value of send, use transfer or even better: Use a pattern where the recipient withdraws the money.

> **!!! WARNING**: Due to the fact that the EVM considers a call to a non-existing contract to always succeed, Solidity includes an extra check using the extcodesize opcode when performing external calls. This ensures that the contract that is about to be called either actually exists (it contains code) or an exception is raised. The low-level calls which operate on addresses rather than contract instances (i.e. .call(), .delegatecall(), .staticcall(), .send() and .transfer()) do not include this check, which makes them cheaper in terms of gas but also less safe.

> **! NOTE**: Prior to version 0.5.0, Solidity allowed address members to be accessed by a contract instance, for example this.balance. This is now forbidden and an explicit conversion to address must be done: address(this).balance.

> **! NOTE**: If state variables are accessed via a low-level delegatecall, the storage layout of the two contracts must align in order for the called contract to correctly access the storage variables of the calling contract by name. This is of course not the case if storage pointers are passed as function arguments as in the case for the high-level libraries.

> **! NOTE**: Prior to version 0.5.0, .call, .delegatecall and .staticcall only returned the success condition and not the return data.

> **! NOTE**: Prior to version 0.5.0, there was a member called callcode with similar but slightly different semantics than delegatecall.

- Use `call` function to inherit from libraries, especially when you don't need to change contract storage and do not care about gas control.
- When inheriting from a library intending to alter your contract's storage, make sure to ine up your storage slots with the library's storage slots to avoid unexpected state changes.
- Authenticate and do conditional checks on functions that invoke `delegatecall`s.

## Deploy & Test
#### Installation
```console
npm install
npx hardhat node
```

#### Deployment
```console
npx hardhat run --network [NETWORK-NAME] scripts/deploy.js
```

#### Test
You should see the `owner` of `Delegation` contract is changed.
```console
npx hardhat test
Compiling 1 file with 0.8.4
Solidity compilation finished successfully


  Delegation
    deployment
      ✓ should set the owners

  DelegationAttack
    deployment
      ✓ should set the attacker
    #attack
      ✓ should be reverted if non-attacker tries
      ✓ should change the owner of the Delegate contract


  4 passing (1s)
```

If you're familiar with hardhat console, you can test the `delegation` on your local node by using `npx hardhat node` and `npx hardhat console`.
