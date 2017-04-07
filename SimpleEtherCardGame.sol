pragma solidity 0.4.10;

contract SimpleEtherCardGame {
    address[] players;
    uint256 buy_in;
    uint256 close_block;
    uint8 closers;
    bool started;

    struct Player {
        address addr;
        uint256 balance;
    }

    struct State {
        uint32 nonce;
        uint8 sigs;
        uint256[] balances;
    }

    State[] proposals;
    State verified;

    function SimpleEtherCardGame(uint _buy_in) {
        buy_in = _buy_in;
        started = false;
    }

    function state(uint32 nonce, uint256[] balances) returns (bool) {
        if (nonce <= verified.nonce || balances.length != players.length) {
            return false;
        }

        int16 idx = findSender();

        if (idx == -1) {
            return false;
        }

        bool signed = false;

        for (uint8 p = 0; p < proposals.length; ++p) {
            if (p == idx) {
                continue;
            }

            State proposal = proposals[p];
            if (proposal.nonce == nonce) {
                bool same = true;
                for (uint8 b = 0; b < proposal.balances.length; ++b) {
                    if (balances[b] != proposal.balances[b]) {
                        same = false;
                        break;
                    }
                }

                if (!same) {
                    continue;
                }

                signed = true;
                proposal.sigs |= 1 << idx;

                if (proposal.sigs == 0xFF >> (8 - players.length)) {
                    verified = proposal;
                    return true;
                }
            }
        }

        if (!signed) {
            uint256 i = uint256(idx);
            proposals[i].nonce = nonce;
            proposals[i].balances = balances;
            proposals[i].sigs = 1 << idx;
        }

        return true;
    }

    function join() payable returns (bool) {
        if (started || msg.value != buy_in || players.length == 8) {
            msg.sender.transfer(msg.value);
            return false;
        }

        for (uint8 i = 0; i < players.length; ++i) {
            if (players[i] == msg.sender) {
                msg.sender.transfer(msg.value);
                return false;
            }
        }

        players.push(msg.sender);
        return true;
    }

    function start() returns (bool) {
        if (started || players.length < 3) {
            return false;
        }

        if (findSender() > -1) {
            return false;
        }

        started = true;

        verified.nonce = 1;
        verified.sigs = 0xFF;

        for (uint8 i = 0; i < players.length; ++i) {
            verified.balances[i] = buy_in;
            proposals.push(State({
                nonce: 0,
                sigs: 0,
                balances: new uint256[](players.length)
            }));
        }

        return true;
    }

    function findSender() returns (int16) {
        for (uint8 i = 0; i < players.length; ++i) {
            if (players[i] == msg.sender) {
                return i;
            }
        }
        return -1;
    }

    function close() returns (bool) {
        int16 idx = findSender();

        if (idx == -1) {
            return false;
        }

        if (!started) {
            for (i = 0; i < players.length; ++i) {
                players[i].transfer(buy_in);
            }
            return true;
        }

        closers |= 1 << idx;

        if (close_block > 0) {
            if (block.number < close_block) {
                if (closers == 0xFF >> (8 - players.length)) {
                    close_block = 1;
                }
            }

            if (block.number >= close_block) {
                for (uint8 i = 0; i < players.length; ++i) {
                    players[i].transfer(verified.balances[i]);
                }
            }
        }
        else {
            close_block = block.number + 200;
        }

        return true;
    }
}
