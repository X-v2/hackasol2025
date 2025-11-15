// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TurboRacers is ERC721, Ownable {

    struct Racer {
        string name;
        uint8 speed;
        uint8 aggression;
        uint8 handling;
        uint8 tyreManagement;
        uint8[5] favTracks;
        uint8[3] favConditions;
        uint256 currentPrice;
    }

    mapping(uint256 => Racer) private racers;
    uint256[] private allRacerIds;

    address public priceUpdater;

    event PriceUpdated(uint256 indexed id, uint256 oldPrice, uint256 newPrice, address indexed by);
    event PriceUpdaterChanged(address indexed previousUpdater, address indexed newUpdater);

    modifier onlyUpdater() {
        require(msg.sender == owner() || msg.sender == priceUpdater, "Not authorized");
        _;
    }

    constructor() ERC721("TurboRacers", "RCR") Ownable(msg.sender) {
        priceUpdater = msg.sender;
    }

    function setPriceUpdater(address _updater) external onlyOwner {
        address prev = priceUpdater;
        priceUpdater = _updater;
        emit PriceUpdaterChanged(prev, _updater);
    }

    function mintRacer(
        address _to,
        uint256 _id,
        string memory _name,
        uint8 _speed,
        uint8 _aggression,
        uint8 _handling,
        uint8 _tyreManagement,
        uint8[5] memory _favTracks,
        uint8[3] memory _favConditions,
        uint256 _initialPrice
    ) external onlyOwner {

        _mint(_to, _id);
        allRacerIds.push(_id);

        racers[_id] = Racer({
            name: _name,
            speed: _speed,
            aggression: _aggression,
            handling: _handling,
            tyreManagement: _tyreManagement,
            favTracks: _favTracks,
            favConditions: _favConditions,
            currentPrice: _initialPrice
        });
    }

    function getAllRacerIds() external view returns (uint256[] memory) {
        return allRacerIds;
    }

    function getRacer(uint256 id) 
        external 
        view 
        returns (
            uint256,
            address,
            string memory,
            uint8,
            uint8,
            uint8,
            uint8,
            uint8[5] memory,
            uint8[3] memory,
            uint256
        ) 
    {
        _requireOwned(id);
        Racer storage r = racers[id];

        return (
            id,
            ownerOf(id),
            r.name,
            r.speed,
            r.aggression,
            r.handling,
            r.tyreManagement,
            r.favTracks,
            r.favConditions,
            r.currentPrice
        );
    }

    function updatePrice(uint256 id, uint256 newPrice) external onlyUpdater {
        _requireOwned(id);

        uint256 oldPrice = racers[id].currentPrice;
        racers[id].currentPrice = newPrice;

        emit PriceUpdated(id, oldPrice, newPrice, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
