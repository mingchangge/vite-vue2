// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.20;

interface IStateful {
    enum State {
        READON, // 拍卖信息初始化，展示拍卖信息
        OPEN, // 拍卖可接受报价
        CLOSED, // 拍卖不可接受新报价
        COMPLETED, // 拍卖撮合完成
        UNSOLD, // 流拍
        TERMINATED // 转让终止
    }

    function state() external view returns (State);
}
