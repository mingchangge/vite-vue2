// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.4 <0.9.0;

import "./IStateful.sol";
import "@openzeppelin/contracts/access/manager/AccessManager.sol";
import "@openzeppelin/contracts/access/manager/AccessManaged.sol";

contract TransferTree is AccessManaged {
    // 本合约记录了一个订单被多次转让的全流程.
    // 从某一个初始的转让订单开始，直到结束，每一次转让都会记录在这个合约中.
    // 一个数组记录了每一次转让的信息.

    struct Transfer {
        // ongoing Transfer
        uint fromIdx; //此次转让的来源，是Receipt_list的下标
        uint idx;
        address owner; // 转让的发起方的地址
        uint price; //转让的价格
        uint portion; //转让的份数
        uint remainedPortion; // 发起方剩余的可被购买的份数，初始值等于portion
    }

    struct Receipt {
        // completed Transfer
        uint fromIdx; //此次转让的来源的，是Transfer_list的下标
        uint idx;
        address from; //转让发起方
        address to; // 转让接收方
        uint price; //接受价格
        uint portion; //接受的份数
        uint remainedPortion; // 接收方可以再次转让的份数，初始值等于portion
    }

    uint public unitAmount;
    address public originalOwner; // 最开始的拥有者
    address public creator; // Auction合约地址 或 Maker合约的地址
    bool public isSelling;
    bool public splittable;
    bool public hasSettled; // 转让是否还在进行

    Transfer[] public transferList; //记录了每一个被发起的转让
    Receipt[] public receiptList; //记录了每一个完成的转让

    event NewTransfer(Transfer transfer);
    event NewReceipt(Receipt receipt);

    modifier operatable(bool ifend) {
        require(!hasSettled, "Operation failed.");
        ifend
            ? require(
                IStateful(creator).state() == IStateful.State.TERMINATED,
                "Operation failed."
            )
            : require(
                IStateful(creator).state() != IStateful.State.TERMINATED,
                "Fail to terminate."
            );

        _;
    }

    constructor(
        address adminContract_,
        address ownerAddress_,
        address from_,
        uint price_,
        uint unitAmount_,
        uint portion_,
        bool isSelling_
    ) AccessManaged(adminContract_) {
        // _from ：收据的来源，可能是拍卖的地址，也可能是挂单合约的地址
        require(unitAmount_ > 0 && portion_ > 0, "Invalid basic infos.");
        originalOwner = ownerAddress_;
        unitAmount = unitAmount_;
        creator = from_;
        splittable = (portion_ > 1);
        isSelling = isSelling_;
        hasSettled = false;
        receiptList.push(
            Receipt(0, 0, from_, originalOwner, price_, portion_, portion_)
        ); // 第一个收据，整个转让的root, 价格设置为0.
    }

    // 只能可摘单的用户可调用
    function acceptTransfer(
        uint fromIdx_,
        uint portion_
    ) public restricted operatable(false) {
        // 接受转让
        require(fromIdx_ < transferLen(), "No such receipt.");
        require(portion_ > 0, "Amount should be positive.");
        require(
            transferList[fromIdx_].remainedPortion >= portion_,
            "Not enough remaining amount."
        );
        require(
            transferList[fromIdx_].owner != msg.sender,
            "Cannot accept from yourself"
        ); //TODO
        require(!hasSettled, "This Transfer is closed.");
        uint index = receiptLen();
        transferList[fromIdx_].remainedPortion -= portion_;
        address seller = transferList[fromIdx_].owner;
        Receipt memory topush = Receipt(
            fromIdx_,
            index,
            seller,
            msg.sender,
            transferList[fromIdx_].price,
            portion_,
            portion_
        );
        receiptList.push(topush);
        emit NewReceipt(topush);
    }

    function newTransfer(
        uint fromIdx_,
        uint price_,
        uint portion_
    ) public operatable(false) {
        // 创建新的转让
        require(fromIdx_ < receiptLen(), "No such transfer.");
        require(portion_ > 0, "Amount should be positive");
        require(
            receiptList[fromIdx_].remainedPortion >= portion_,
            "Not enough amount remained."
        );
        require(
            receiptList[fromIdx_].to == msg.sender,
            "Using wrong idx to transfer."
        );
        uint index = transferLen();
        receiptList[fromIdx_].remainedPortion -= portion_;
        Transfer memory topush = Transfer(
            fromIdx_,
            index,
            msg.sender,
            price_,
            portion_,
            portion_
        );
        transferList.push(topush);
        emit NewTransfer(topush);
    }

    // 只能中心调用
    function terminateTransfer() external restricted operatable(true) {
        hasSettled = true;
        uint idx;
        Receipt memory tmp;
        // 遍历 Transfer_list, 将所有的剩余份数加到Receipt_list中
        for (uint i = 0; i < transferList.length; i++) {
            idx = transferList[i].fromIdx;
            receiptList[idx].remainedPortion += transferList[i].remainedPortion;
        }
        for (uint i = 0; i < receiptList.length; i++) {
            tmp = receiptList[i];
            assert(tmp.remainedPortion <= tmp.portion);
        }
    }

    function transferLen() public view returns (uint length) {
        length = transferList.length;
    }

    function receiptLen() public view returns (uint length) {
        length = receiptList.length;
    }
}
