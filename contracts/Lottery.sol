// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Lottery is Ownable {
    struct Player {
        uint amount;
        address playerAddress;
    }

    Player[] players;

    mapping(address => bool) addressToIsEntered;

    address public winnerAddress;

    uint public playerCount;

    event PICK_WINNER(address indexed winner);

    event TRANSFERED_WINNER_PRIZE(address indexed winner, uint amount);

    function getPrizePool() public view returns(uint) {
        return address(this).balance;
    }

    function enter() public payable {
        require(!addressToIsEntered[msg.sender], "Player has entered");
        require(msg.value >= (0.001 * 1 ether), "Must be bigger than 0.001 to participate");

        players.push(Player({
            amount: msg.value,
            playerAddress: msg.sender
        }));

        addressToIsEntered[msg.sender] = true;

        playerCount++;
    }

    function random() public view returns (uint) {
        return uint(keccak256(abi.encode(block.difficulty, block.timestamp, players))) % players.length;
    }

    function transferAllMoneyToWinner(address payable _address) internal {
        uint amount = getPrizePool();
        (bool success, ) = _address.call{value: amount}("");
        emit TRANSFERED_WINNER_PRIZE(_address, amount);
        require(success, "Transfer the prize pool to winner");
    }

    function pickWinner() public onlyOwner() {
        uint randomIndex = random();
        address randomizedAddress = players[randomIndex].playerAddress;
        winnerAddress = randomizedAddress;
        emit PICK_WINNER(randomizedAddress);
        transferAllMoneyToWinner(payable(winnerAddress));
    }

    function getPlayer(address _address) public view returns (uint amount)  {
       for(uint i=0; i < players.length; i++) {
           if (players[i].playerAddress == _address) {
               amount = players[i].amount;
           }
       }
    }

    receive() external payable {
        enter();
    }
}
