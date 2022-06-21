//SPDX-License-Identifier: MIT
// contracts/ERC721.sol
// upgradeable contract

pragma solidity >=0.8.0;


contract CaptainUtils {

        address private _owner;
        mapping(uint256 => CaptainDetails) public allCaptainDetails;

      // upgrade contract to support authorized

    mapping(address => bool) public authorized;

    
    struct CaptainDetails {
        uint256 tokenId;
        address mintedBy;
        address currentOwner;
        uint256 previousPrice;
        uint256 price;
        uint256 numberOfTransfers;
        bool forSale;
        uint256 ton;
    }


    modifier onlyAuthorized() {
        require(authorized[msg.sender] ||  msg.sender == _owner , "Not authorized");
        _;
    }

    function addAuthorized(address _toAdd) public {
        require(msg.sender == _owner, 'Not owner');
        require(_toAdd != address(0));
        authorized[_toAdd] = true;
    }

    function removeAuthorized(address _toRemove) public {
        require(msg.sender == _owner, 'Not owner');
        require(_toRemove != address(0));
        require(_toRemove != msg.sender);
        authorized[_toRemove] = false;
    }



}