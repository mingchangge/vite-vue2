// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "./IStateful.sol";
import "@openzeppelin/contracts/access/manager/AccessManager.sol";
import "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Listing is AccessManaged, IStateful {
    // 本合约记录订单的可分裂挂单交易

    // 挂牌/摘牌的订单
    struct Node {
        uint128 orderId; // 订单ID, 不可以重复
        uint128 parent; // 父订单ID
        address owner; // 持有者地址
        uint portion; // 持有份数
        uint residue; // 剩余份数 如果剩余分数为0，则表示已经被摘牌
        uint unitPrice; // 摘牌单价
        bool listing; // 是否挂牌中
        uint16 childNum; // 子订单数量
        uint16 depth; // 深度
        uint timestamp; // 记录区块链时间
    }

    Node public root; // 根订单
    uint32 public nodeNum; // 总的订单数量

    Node empty; // 空节点

    // 订单ID映射到订单
    // id 为orderId depth index 的keccak256散列值
    mapping(bytes32 => Node) public nodeMap;

    // 订单ID是否已存在
    mapping(uint128 => bool) public orderIdMap;

    // 订单保证金、手续费扣除状态
    mapping(uint128 => bool) public feeDeduction;

    address public adminContract; // 中心管理合约地址，用于权限管理
    address public creator; // 实际发起挂单的用户
    bool public isSelling; // true：预售；false：预购
    bool public transferrable; // true：可转让；false：不可转让
    string public category; // 煤炭种类
    uint128 public mainOrderId; // 原始订单ID
    uint public portion; // 挂单总份数，实际挂单总量为portion * unitAmount
    uint public unitAmount; // 单份摘单数量
    uint public unitPrice; // 单份摘单价格
    State public state; // 挂单当前状态
    bool public isAuction; // 是否从竞价创建挂牌

    modifier onState(State state_) {
        require(state == state_, "Wrong state. Access denied.");
        _;
    }

    constructor(
        address adminContract_,
        address creator_,
        bool isSelling_,
        bool transferrable_,
        string memory category_,
        uint128 parentOrderId_,
        uint128 orderId_,
        uint portion_,
        uint unitAmount_,
        uint unitPrice_,
        bool isAuction_
    ) AccessManaged(adminContract_) {
        adminContract = adminContract_;
        creator = creator_;
        isSelling = isSelling_;
        transferrable = transferrable_;
        category = category_;
        mainOrderId = orderId_;
        portion = portion_;
        unitAmount = unitAmount_;
        unitPrice = unitPrice_;
        isAuction = isAuction_;

        // 如果是竞价订单创建的挂牌订单，状态直接设置为OPEN，因为没有管理员审核的过程
        state = isAuction_ ? State.OPEN : State.READON;

        nodeNum = 1;
        root = Node(
            mainOrderId,
            parentOrderId_,
            creator,
            portion,
            portion,
            unitPrice,
            !isAuction_, // 默认审批通过的订单是挂牌中的, 竞价订单不需要审批需要再次挂牌
            0, // 子订单数量
            0, // 深度
            block.timestamp
        );
    }

    function openOrder() public restricted onState(State.READON) {
        state = State.OPEN;
    }

    function getNodeId(
        uint128 orderId_,
        uint16 depth_,
        uint16 childIdx_
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(orderId_, depth_, childIdx_));
    }

    function getNodeId(Node storage node) private view returns (bytes32) {
        return getNodeId(node.orderId, node.depth, node.childNum);
    }

    // 根据订单ID、节点深度、子节点序号获取节点
    function getNode(
        uint128 orderId_,
        uint16 depth_,
        uint16 childIdx_
    ) public view returns (Node memory) {
        bytes32 nodeId = getNodeId(orderId_, depth_, childIdx_);
        Node storage child = nodeMap[nodeId];
        return child;
    }

    // 通过orderId找到对应的子订单, 公开函数
    function findOrder(uint128 orderId_) public view returns (Node memory) {
        Node storage node = findNode(orderId_);
        return node;
    }

    // 通过orderId找到对应的子订单
    function findNode(uint128 orderId_) private view returns (Node storage) {
        Node storage node = find(root, orderId_);
        if (node.owner == address(0)) {
            revert("order not found");
        }
        return node;
    }

    function find(
        Node storage parent_,
        uint128 orderId_
    ) private view returns (Node storage) {
        // 从root开始遍历，找到对应的子订单
        Node storage node = parent_;

        // iterate throught the node and its children to find the node with orderId_
        if (node.orderId == orderId_) {
            return node;
        }

        if (node.childNum == 0) {
            return empty;
        }

        for (uint16 i = 1; i <= node.childNum; i++) {
            bytes32 nodeId = getNodeId(node.orderId, node.depth, i);
            Node storage child = nodeMap[nodeId];
            if (child.owner == address(0)) {
                revert("Child not found");
            }

            if (child.orderId == orderId_) {
                return child;
            }

            Node storage grandChild = find(child, orderId_);
            if (grandChild.owner != address(0)) {
                return grandChild;
            }
        }

        return empty;
    }

    // 保证金冻结
    function feeDeducted(
        uint128 orderId_
    ) public restricted onState(State.OPEN) {
        require(!feeDeduction[orderId_], "Fee already deducted.");
        feeDeduction[orderId_] = true;
    }

    // 保证金释放
    function feeReleased(
        uint128 orderId_
    ) public restricted onState(State.OPEN) {
        require(feeDeduction[orderId_], "Fee already released.");
        feeDeduction[orderId_] = false;
    }

    // 对订单进行挂牌
    function list(
        uint128 parent_orderId_, // 上级订单ID
        uint128 orderId_, // 订单ID
        uint portion_,
        uint unitPrice_
    ) public onState(State.OPEN) {
        require(orderIdMap[orderId_] == false, "OrderId already exists.");

        Node storage node = findNode(parent_orderId_);

        require(node.residue >= portion_, "No residue."); // 有剩余才能重新挂牌
        require(node.listing == false, "Already listed."); // 未挂牌才能重新挂牌

        // 不可转让的订单，不允许再次挂牌
        if (transferrable == false) {
            require(node.depth == 0, "Only transferrable for once.");
        }

        // 如果是从竞价订单创建的挂牌订单，首次挂牌不需要验证保证金、手续费缴纳
        // 因为在竞价订单创建转让时已经验证过了，但是后续的再次挂牌仍需要验证
        if (isAuction && node.depth == 0) {
            require(node.owner == tx.origin, "Not the auction owner.");
        } else {
            // 验证保证金、手续费缴纳
            require(feeDeduction[orderId_], "Fee not deducted.");
            require(node.owner == msg.sender, "Not the list owner."); // 只有订单持有者才能挂牌
        }

        node.residue = node.residue - portion_;
        node.childNum++;
        bytes32 nodeId = getNodeId(node);
        nodeMap[nodeId] = Node(
            orderId_,
            node.orderId,
            msg.sender,
            portion_,
            portion_,
            unitPrice_,
            true, // 挂牌中
            0,
            node.depth + 1,
            block.timestamp
        );
        orderIdMap[orderId_] = true;
        nodeNum++;
    }

    // 摘牌订单
    function delist(
        uint128 parent_orderId_, // 上级订单ID
        uint128 orderId_, // 订单ID
        uint portion_
    ) public onState(State.OPEN) {
        require(orderIdMap[orderId_] == false, "OrderId already exists.");

        Node storage node = findNode(parent_orderId_);
        require(node.owner != msg.sender, "Already the owner");
        require(node.residue >= portion_, "No residue");
        require(node.listing == true, "Not listed");
        require(feeDeduction[orderId_], "Fee not deducted."); // 验证保证金、手续费缴纳

        node.residue = node.residue - portion_;
        node.childNum++;
        bytes32 nodeId = getNodeId(node);
        nodeMap[nodeId] = Node(
            orderId_,
            node.orderId,
            msg.sender,
            portion_,
            portion_,
            node.unitPrice, // 摘牌的价格就是挂牌的价格
            false,
            0,
            node.depth + 1,
            block.timestamp
        );
        orderIdMap[orderId_] = true;
        nodeNum++;
    }

    function closeOrder() public restricted onState(State.OPEN) {
        state = State.CLOSED;
    }

    function splittable() public view returns (bool splittable_) {
        splittable_ = portion > 1;
    }

    function completeOrder() public restricted onState(State.CLOSED) {
        state = State.COMPLETED;
    }

    function terminateOrder() public restricted onState(State.COMPLETED) {
        state = State.TERMINATED;
    }
}
