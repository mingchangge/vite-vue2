// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.20;

import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";

contract AccessControl is AccessManaged {
    uint16 public value;

    constructor(address admin) AccessManaged(admin) {}

    function reset() external {
        value = 0;
    }

    function set(uint16 val) external restricted {
        value = val;
    }
}
