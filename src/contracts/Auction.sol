// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.20;

import "fhevm/lib/TFHE.sol";
import "./Listing.sol";
import "./SortedArray.sol";
import "./IStateful.sol";
import "@openzeppelin/contracts/access/manager/AccessManager.sol";
import "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
// import "hardhat/console.sol";
// import "fhevm/oracle/OracleCaller.sol";

using EnumerableMap for EnumerableMap.AddressToUintMap;
using SortedArray for SortedArray.Array;

contract Auction is AccessManaged, IStateful {
    address public adminContract; // 中心管理合约地址，用于权限管理
    address public creator; // 实际发起拍卖的买家/卖家
    bool public isSelling; // true：预售；false：预购
    bool public transferrable; // true：可转让；false：不可转让
    string public category; // 煤炭种类
    uint32 public reserve; // 保留价，即拍卖底价
    uint public portion; // 拍卖总份数，实际成交数量为portion * unitAmount
    uint public unitAmount; // 单份拍卖数量
    uint public memberThreshold; // 拍卖开盘最少人数，人数小于该限制订单流拍
    State public state; // 拍卖当前状态

    uint public bidNum; // 接收报价期间表示报价操作数，锁价后（CLOSED）表示合法拍卖数
    uint public winnerNum; // 撮合完成后（COMPLETED）指示成交者数量

    uint128 public mainOrderId; // 原始订单ID
    mapping(uint128 orderId => address listingAddress) public listedContract; // 已经竞价撮合完成的订单创建的挂牌合约

    SortedArray.Array private _sortedArray; // 依照报价优先级维护的报价序列
    EnumerableMap.AddressToUintMap private _bidderId; // 存储报价者地址到报价编号的映射
    mapping(uint index => address bidder) private _dIreddib; // 上述映射的逆映射
    mapping(uint128 => bool) public feeDeduction; // 订单保证金、手续费扣除状态

    euint32 public finalPrice; // 撮合完成后（COMPLETED）指示成交密文

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
        uint128 orderId_,
        uint32 reserve_,
        uint portion_,
        uint unitAmount_,
        uint memberThreshold_
    ) AccessManaged(adminContract_) {
        require(
            portion_ > 0 && unitAmount_ > 0 && memberThreshold_ > 0,
            "Invalid basic infos."
        );
        adminContract = adminContract_;
        creator = creator_;
        isSelling = isSelling_;
        category = category_;
        reserve = reserve_;
        portion = portion_;
        unitAmount = unitAmount_;
        memberThreshold = memberThreshold_;
        transferrable = transferrable_;
        state = State.READON;
        _sortedArray._Compare = isSelling ? _compareSell : _compareBuy;
        _sortedArray._SwapIf = _swapIf;
        mainOrderId = orderId_;
    }

    function openAuction() public restricted onState(State.READON) {
        state = State.OPEN;
    }

    // 保证金冻结
    function feeDeducted(uint128 orderId_) public restricted {
        require(
            state == State.OPEN || state == State.COMPLETED,
            "Wrong state. Fee not deducted."
        );
        feeDeduction[orderId_] = true;
    }

    // 保证金释放
    function feeReleased(uint128 orderId_) public restricted {
        require(
            state == State.OPEN || state == State.COMPLETED,
            "Wrong state. Fee not released."
        );
        feeDeduction[orderId_] = false;
    }

    function placeBid(
        uint128 orderId_,
        bytes memory price_,
        bytes memory portion_
    ) public onState(State.OPEN) {
        // 验证保证金、手续费缴纳
        require(feeDeduction[orderId_], "Fee not deducted.");
        euint32 ePrice = TFHE.asEuint32(price_);
        euint32 ePortion = TFHE.asEuint32(portion_);
        ebool portionCondition = TFHE.and(
            TFHE.gt(ePortion, TFHE.asEuint32(0)),
            TFHE.le(ePortion, TFHE.asEuint32(portion))
        );
        ebool priceCondition = isSelling
            ? TFHE.ge(ePrice, TFHE.asEuint32(reserve))
            : TFHE.le(ePrice, TFHE.asEuint32(reserve));
        ebool condition = TFHE.and(portionCondition, priceCondition);
        require(TFHE.decrypt(condition), "Check the inputs.");
        if (!EnumerableMap.contains(_bidderId, msg.sender)) {
            EnumerableMap.set(_bidderId, msg.sender, bidNum);
            _dIreddib[bidNum] = msg.sender;
            bidNum++;
        }
        _sortedArray.insert(
            SortedArray.Elem(
                TFHE.asEuint32(EnumerableMap.get(_bidderId, msg.sender)),
                SortedArray.Bid(ePrice, ePortion)
            )
        );
    }

    function cancelBid(uint128 orderId_) public onState(State.OPEN) {
        // 验证保证金、手续费释放
        require(feeDeduction[orderId_] == false, "Fee not released.");
        require(
            EnumerableMap.contains(_bidderId, msg.sender),
            "No such bid exists."
        );
        _sortedArray.remove(
            TFHE.asEuint32(EnumerableMap.get(_bidderId, msg.sender))
        );
        EnumerableMap.remove(_bidderId, msg.sender);
    }

    function closeAuction() public restricted onState(State.OPEN) {
        bidNum = EnumerableMap.length(_bidderId);
        if (bidNum < memberThreshold) {
            state = State.UNSOLD;
            assert(state == State.UNSOLD);
            return;
        }
        state = State.CLOSED;
        assert(state == State.CLOSED);
    }

    function completeAuction() public restricted onState(State.CLOSED) {
        euint32 remainedPortion = TFHE.asEuint32(portion);
        euint32 newprice = TFHE.asEuint32(0);
        euint32 currentPrice;
        euint32 currentePortion;
        euint32 claimedPortion;
        ebool additional;
        euint32 winnerNum_ = TFHE.asEuint32(0);
        finalPrice = TFHE.asEuint32(0);
        SortedArray.Bid memory currentresult;
        SortedArray.Bid memory finalresult;
        for (uint index; index < bidNum; index++) {
            currentresult = _sortedArray.at(index).bid;
            currentPrice = currentresult.price;
            currentePortion = currentresult.portion;

            claimedPortion = TFHE.min(currentePortion, remainedPortion);
            remainedPortion = TFHE.sub(remainedPortion, claimedPortion);

            additional = TFHE.gt(claimedPortion, TFHE.asEuint32(0));
            winnerNum_ = TFHE.select(
                additional,
                TFHE.add(winnerNum_, TFHE.asEuint32(1)),
                winnerNum_
            );
            newprice = TFHE.select(additional, currentPrice, newprice);
            finalresult = SortedArray.Bid(currentPrice, claimedPortion);
            _sortedArray.change(index, finalresult);
        }
        winnerNum = TFHE.decrypt(winnerNum_);
        finalPrice = newprice;
        state = State.COMPLETED;
    }

    // 获取最近一次报价
    function getMyBid(
        bytes32 publicKey
    ) public view returns (bytes memory price_, bytes memory portion_) {
        require(state != State.READON, "Wrong state. Access denied.");
        (euint32 myPrice, euint32 myPortion) = _checkBid();
        (price_, portion_) = (
            TFHE.reencrypt(myPrice, publicKey),
            TFHE.reencrypt(myPortion, publicKey)
        );
    }

    function getMyResult(
        bytes32 publicKey
    ) public view returns (bytes memory price_, bytes memory portion_) {
        require(
            state == State.COMPLETED || state == State.TERMINATED,
            "Wrong state. Access denied."
        );
        (euint32 myPrice, euint32 myPortion) = _twoCiphers();
        (price_, portion_) = (
            TFHE.reencrypt(myPrice, publicKey),
            TFHE.reencrypt(myPortion, publicKey)
        );
    }

    function getResultAt(
        bytes32 publicKey,
        uint index
    )
        public
        view
        returns (address bidder_, bytes memory price_, bytes memory portion_)
    {
        require(
            state == State.COMPLETED || state == State.TERMINATED,
            "Wrong state. Access denied."
        );
        if(msg.sender != creator){
            AccessManager manager = AccessManager(authority());
            (bool isMember, ) = manager.hasRole(
                manager.getTargetFunctionRole(address(this), msg.sig),
                msg.sender
            );
            require(isMember, "Not authorized to get result.");
        }
        require(index < winnerNum);
        SortedArray.Elem memory result = _sortedArray.at(index);
        bidder_ = _dIreddib[TFHE.decrypt(result.key)];
        price_ = TFHE.reencrypt(finalPrice, publicKey);
        portion_ = TFHE.reencrypt(result.bid.portion, publicKey);
    }

    function createTransfer(
        uint128 parentOrderId_, // 竞价撮合完成的订单ID
        uint128 orderId_, // 挂牌订单ID
        uint portion_, // 挂牌份数
        uint unitPrice_ // 挂牌单价
    ) public onState(State.COMPLETED) {
        // 竞价订单撮合获胜后挂牌同样需要验证保证金、手续费
        require(feeDeduction[orderId_], "Fee not deducted.");

        address listingAddress = listedContract[parentOrderId_];

        // 这个竞价订单已经创建过挂牌合约，直接执行list操作
        if (listingAddress != address(0)) {
            Listing listingContract = Listing(listingAddress);
            listingContract.list(
                parentOrderId_,
                orderId_,
                portion_,
                unitPrice_
            );
        } else {
            // 第一次由竞价订单创建挂牌合约
            (bool haskey, ) = EnumerableMap.tryGet(_bidderId, msg.sender);
            require(haskey, "You are not a valid bidder.");
            require(transferrable, "Transfer not allowed.");
            (, euint32 myPortion) = _twoCiphers();
            uint validPortion_ = TFHE.decrypt(myPortion);
            require(validPortion_ > 0, "You are not a winner.");

            Listing listingContract = new Listing(
                adminContract,
                msg.sender,
                isSelling,
                true,
                category,
                mainOrderId,
                parentOrderId_,
                validPortion_,
                unitAmount,
                0,
                true
            );

            listingContract.list(
                parentOrderId_,
                orderId_,
                portion_,
                unitPrice_
            );
            listedContract[parentOrderId_] = address(listingContract);
        }
    }

    function terminateAuction() public restricted onState(State.COMPLETED) {
        state = State.TERMINATED;
    }

    function splittable() public view returns (bool splittable_) {
        splittable_ = portion > 1;
    }

    function _twoCiphers()
        internal
        view
        returns (euint32 myPrice, euint32 myPortion)
    {
        (bool haskey, uint index) = EnumerableMap.tryGet(_bidderId, msg.sender);
        require(haskey, "You are not a valid bidder.");
        ebool isMember;
        euint32 currentkey;
        myPortion = TFHE.asEuint32(0);
        myPrice = TFHE.asEuint32(0);
        for (uint i; i < winnerNum; i++) {
            currentkey = _sortedArray.at(i).key;
            isMember = TFHE.eq(currentkey, uint32(index));
            myPortion = TFHE.select(
                isMember,
                _sortedArray.at(i).bid.portion,
                myPortion
            );
            myPrice = TFHE.select(isMember, finalPrice, myPrice);
        }
    }

    function _checkBid()
        internal
        view
        returns (euint32 myPrice, euint32 myPortion)
    {
        (bool haskey, uint index) = EnumerableMap.tryGet(_bidderId, msg.sender);
        require(haskey, "You are not a valid bidder.");
        ebool isMember;
        euint32 currentkey;
        myPortion = TFHE.asEuint32(0);
        myPrice = TFHE.asEuint32(0);
        for (uint i; i < EnumerableMap.length(_bidderId); i++) {
            currentkey = _sortedArray.at(i).key;
            isMember = TFHE.eq(currentkey, uint32(index));
            myPortion = TFHE.select(
                isMember,
                _sortedArray.at(i).bid.portion,
                myPortion
            );
            myPrice = TFHE.select(
                isMember,
                _sortedArray.at(i).bid.price,
                myPrice
            );
        }
    }

    function _compareSell(
        SortedArray.Elem memory a,
        SortedArray.Elem memory b
    ) private pure returns (ebool) {
        SortedArray.Bid memory abid = a.bid;
        SortedArray.Bid memory bbid = b.bid;
        ebool priceCondition = TFHE.gt(abid.price, bbid.price);
        ebool priceMargin = TFHE.eq(abid.price, bbid.price);
        ebool portionCondition = TFHE.gt(abid.portion, bbid.portion);
        return TFHE.or(priceCondition, TFHE.and(priceMargin, portionCondition));
    }

    function _compareBuy(
        SortedArray.Elem memory a,
        SortedArray.Elem memory b
    ) private pure returns (ebool) {
        SortedArray.Bid memory abid = a.bid;
        SortedArray.Bid memory bbid = b.bid;
        ebool priceCondition = TFHE.lt(abid.price, bbid.price);
        ebool priceMargin = TFHE.eq(abid.price, bbid.price);
        ebool portionCondition = TFHE.gt(abid.portion, bbid.portion);

        return TFHE.or(priceCondition, TFHE.and(priceMargin, portionCondition));
    }

    function _swapIf(
        ebool cond,
        SortedArray.Elem storage a,
        SortedArray.Elem storage b
    ) private {
        SortedArray.Elem memory c = SortedArray.Elem(a.key, a.bid);
        a.key = TFHE.select(cond, b.key, c.key);
        b.key = TFHE.select(cond, c.key, b.key);
        a.bid.price = TFHE.select(cond, b.bid.price, c.bid.price);
        b.bid.price = TFHE.select(cond, c.bid.price, b.bid.price);
        a.bid.portion = TFHE.select(cond, b.bid.portion, c.bid.portion);
        b.bid.portion = TFHE.select(cond, c.bid.portion, b.bid.portion);
    }
}
