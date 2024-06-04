// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.20;

import "fhevm/lib/TFHE.sol";

library SortedArray {
    struct Bid {
        euint32 price;
        euint32 portion;
    }

    struct Elem {
        euint32 key;
        Bid bid;
    }

    uint16 constant INVALID_KEY = type(uint16).max;

    struct Array {
        Elem[] _elems;
        function(Elem memory, Elem memory) internal pure returns (ebool) _Compare;
        function(ebool, Elem storage, Elem storage) internal _SwapIf;
    }

    function size(Array storage self) internal view returns (uint16) {
        euint16 esize = TFHE.asEuint16(0);
        for (uint i = 0; i < self._elems.length; i++) {
            esize = TFHE.select(TFHE.eq(self._elems[i].key, INVALID_KEY), esize, TFHE.add(esize, 1));
        }
        return TFHE.decrypt(esize);
    }

    function at(Array storage self, uint index) internal view returns (Elem storage elem) {
        elem = self._elems[index];
    }

    function change(Array storage self, uint index, Bid memory bid) internal {
        self._elems[index].bid = bid;
    }

    function insert(Array storage self, Elem memory elem) internal {
        remove(self, elem.key);
        self._elems.push(elem);
        for (uint i = 0; i < self._elems.length - 1; i++) {
            self._SwapIf(
                TFHE.or(TFHE.eq(INVALID_KEY, self._elems[i].key), self._Compare(elem, self._elems[i])),
                self._elems[self._elems.length - 1],
                self._elems[i]
            );
        }
    }

    function remove(Array storage self, euint32 key) internal {
        if (self._elems.length > 0) {
            uint16 index = 0;
            while (true) {
                ebool found = TFHE.eq(self._elems[index].key, key);
                if (index < self._elems.length - 1) {
                    self._SwapIf(found, self._elems[index], self._elems[index + 1]);
                } else {
                    self._elems[index].key = TFHE.select(found, TFHE.asEuint32(INVALID_KEY), self._elems[index].key);
                    break;
                }
                index++;
            }
        }
    }
}
