// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "./IStateful.sol";
import "./TransferTree.sol";
import "@openzeppelin/contracts/access/manager/AccessManager.sol";
import "@openzeppelin/contracts/access/manager/AccessManaged.sol";

contract Maker is AccessManaged, IStateful {
    // 本合约记录了一次挂单交易

    struct Taker {
        address takerAddress; // 摘单者地址
        uint portion; // 摘单份数
    }

    address public adminContract; // 中心管理合约地址，用于权限管理
    address public creator; // 实际发起挂单的用户
    bool public isSelling; // true：预售；false：预购
    bool public transferrable; // true：可转让；false：不可转让
    string public category; // 煤炭种类
    uint public portion; // 挂单总份数，实际挂单总量为portion * unitAmount
    uint public remainingPortion; // 剩余未被摘单的份数
    uint public unitAmount; // 单份摘单数量
    uint public unitPrice; // 每一吨的摘单价格
    State public state; // 挂单当前状态
    Taker[] public takerList; // 记录了每一个摘单者的信息

    modifier onState(State state_) {
        require(state == state_, "Wrong state. Access denied.");
        _;
    }

    event NewTransferTree(address orderAddress, address contractAddress);

    constructor(
        address adminContract_,
        address creator_,
        bool isSelling_,
        bool transferrable_,
        string memory category_,
        uint portion_,
        uint unitAmount_,
        uint unitPrice_
    ) AccessManaged(adminContract_) {
        adminContract = adminContract_;
        creator = creator_;
        isSelling = isSelling_;
        transferrable = transferrable_;
        category = category_;
        portion = portion_;
        remainingPortion = portion_;
        unitAmount = unitAmount_;
        unitPrice = unitPrice_;
        state = State.READON;
    }

    function openOrder() public restricted onState(State.READON) {
        state = State.OPEN;
    }

    function takeOrder(uint portion_) public restricted onState(State.OPEN) {
        require(portion_ <= remainingPortion, "Not enough to take.");
        takerList.push(Taker(msg.sender, portion_));
    }

    function takerNum() public view returns (uint num_) {
        num_ = takerList.length;
    }

    function closeOrder() public restricted onState(State.OPEN) {
        state = State.CLOSED;
    }

    function splittable() public view returns (bool splittable_) {
        splittable_ = portion > 1;
    }

    function completeOrder() public restricted onState(State.CLOSED) {
        state = State.COMPLETED;
        if (transferrable == false) {
            return; // 如果不可转让，不需要创建transfertree
        }
        for (uint i = 0; i < takerList.length; i++) {
            TransferTree transfercontract = new TransferTree(
                adminContract,
                takerList[i].takerAddress,
                address(this),
                0,
                unitAmount,
                takerList[i].portion,
                isSelling
            );
            address transferAddress = address(transfercontract);
            emit NewTransferTree(address(this), transferAddress);
        }
    }

    function terminateOrder() public restricted onState(State.COMPLETED) {
        state = State.TERMINATED;
    }
}
