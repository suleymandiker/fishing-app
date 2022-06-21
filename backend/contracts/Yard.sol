//SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "./Authorizable.sol";
import "./Captain.sol";
import "./Fish.sol";

import "hardhat/console.sol";

contract Yard is ERC20, Authorizable {
    using SafeMath for uint256;

    uint256 public MAX_FEED_SUPPLY = 32000000000000000000000000000;
    string private TOKEN_NAME = "YARD";
    string private TOKEN_SYMBOL = "YARD";

    address public CAPTAIN_CONTRACT;
    address public FISH_CONTRACT;

    uint256 public BOOSTER_MULTIPLIER = 1;
    uint256 public FEED_FARMING_FACTOR = 3; // fish to feed ratio
    uint256 public FEED_SWAP_FACTOR = 12; // swap fish for feed ratio

    // yard mint event
    event Minted(address owner, uint256 numberOfFeed);
    event Burned(address owner, uint256 numberOfFeed);
    event FishSwap(address owner, uint256 numberOfFeed);
    // fish event
    event MintedFish(address owner, uint256 numberOfFeed);
    event BurnedFish(address owner, uint256 numberOfEggs);
    event StakedFish(address owner, uint256 numberOfEggs);
    event UnstakedFish(address owner, uint256 numberOfEggs);

    // Fish staking
    struct FishStake {
        // user wallet - who we have to pay back for the staked egg.
        address user;
        // used to calculate how much feed since.
        uint32 since;
        // amount of eggs that have been staked.
        uint256 amount;
    }

    mapping(address => FishStake) public fishStakeHolders;
    uint256 public totalFishStaked;
    address[] public _allFishStakeHolders;
    mapping(address => uint256) private _allFishStakeHoldersIndex;

    // fish stake and unstake
    event FishStaked(address user, uint256 amount);
    event FishUnStaked(address user, uint256 amount);

    constructor(address _captainContract, address _fishContract)
        ERC20(TOKEN_NAME, TOKEN_SYMBOL)
    {
        CAPTAIN_CONTRACT = _captainContract;
        FISH_CONTRACT = _fishContract;
    }

    /**
     * pdates user's amount of staked fish to the given value. Resets the "since" timestamp.
     */
    function _upsertFishStaking(
        address user,
        uint256 amount
    ) internal {
        // NOTE does this ever happen?
        require(user != address(0), "EMPTY ADDRESS");
        FishStake memory fish = fishStakeHolders[user];

        // if first time user is staking $egg...
        if (fish.user == address(0)) {
            // add tracker for first time staker
            _allFishStakeHoldersIndex[user] = _allFishStakeHolders.length;
            _allFishStakeHolders.push(user);
        }
        // since its an upsert, we took out old egg and add new amount
        uint256 previousFish = fish.amount;
        // update stake
        fish.user = user;
        fish.amount = amount;
        fish.since = uint32(block.timestamp);

        fishStakeHolders[user] = fish;
        totalFishStaked = totalFishStaked - previousFish + (amount*1e18);
        emit FishStaked(user, amount);
    }

    function staking(uint256 amount) external {
        require(amount > 0, "NEED EGG");

        Fish fishContract = Fish(FISH_CONTRACT);
        uint256 available = fishContract.balanceOf(msg.sender);
        require(available >= amount, "NOT ENOUGH FISH");
        FishStake memory existingFish = fishStakeHolders[msg.sender];
        if (existingFish.amount > 0) {
            // already have previous egg staked
            // need to calculate claimable
            uint256 projection = claimableView(msg.sender);
            // mint feed to wallet
            _mint(msg.sender, projection);
            emit Minted(msg.sender, amount);
            _upsertFishStaking(msg.sender, existingFish.amount + (amount));
        } else {
            // no egg staked just update staking
            _upsertFishStaking(msg.sender, amount);
        }
        fishContract.burnFish(msg.sender, amount);
        emit StakedFish(msg.sender, amount);
    }

    /**
     * Calculates how much feed is available to claim.
     */
    function claimableView(address user) public view returns (uint256) {
        FishStake memory fish = fishStakeHolders[user];
        require(fish.user != address(0), "NOT STAKED For claimableView");
        // need to add 10000000000 to factor for decimal
        return
            ((fish.amount * FEED_FARMING_FACTOR) *
                (((block.timestamp - fish.since) * 10000000000) / 86400) *
                BOOSTER_MULTIPLIER) /
            10000000000;
    }

    // NOTE withdrawing egg without claiming feed
    function withdrawEgg(uint256 amount) external {
        require(amount > 0, "MUST BE MORE THAN 0");
        FishStake memory fish = fishStakeHolders[msg.sender];
        require(fish.user != address(0), "NOT STAKED for withdrawEgg");
        require(amount <= fish.amount, "OVERDRAWN");

        Fish fishContract = Fish(FISH_CONTRACT);
        // uint256 projection = claimableView(msg.sender);
        _upsertFishStaking(msg.sender, fish.amount - amount);
        // Need to burn 1/12 when withdrawing (breakage fee)
        uint256 afterBurned = (amount * 11) / 12;
        // mint egg to return to user
        fishContract.mintFish(msg.sender, afterBurned);
        emit UnstakedFish(msg.sender, afterBurned);
    }

    /**
     * Claims feed from staked Egg
     */
    function claimYard() external {
        uint256 projection = claimableView(msg.sender);
        require(projection > 0, "NO FEED TO CLAIM");

        FishStake memory fish = fishStakeHolders[msg.sender];

        // Updates user's amount of staked eggs to the given value. Resets the "since" timestamp.
        _upsertFishStaking(msg.sender, fish.amount);

        // check: that the total Feed supply hasn't been exceeded.
        _mintYard(msg.sender, projection);
    }

    /**
     */
    function _removeUserFromFishEnumeration(address user) private {
        uint256 lastUserIndex = _allFishStakeHolders.length - 1;
        uint256 currentUserIndex = _allFishStakeHoldersIndex[user];

        address lastUser = _allFishStakeHolders[lastUserIndex];

        _allFishStakeHolders[currentUserIndex] = lastUser; // Move the last token to the slot of the to-delete token
        _allFishStakeHoldersIndex[lastUser] = currentUserIndex; // Update the moved token's index

        // This also deletes the contents at the last position of the array
        delete _allFishStakeHoldersIndex[user];
        _allFishStakeHolders.pop();
    }

    /**
     * Unstakes the eggs, returns the Eggs (mints) to the user.
     */
    function withdrawAllEggAndClaimFeed() external {
        FishStake memory fish = fishStakeHolders[msg.sender];

        // NOTE does this ever happen?
        require(fish.user != address(0), "NOT STAKED for withdrawAllEggAndClaimFeed");

        // if there's feed to claim, supply it to the owner...
        uint256 projection = claimableView(msg.sender);
        if (projection > 0) {
            // supply feed to the sender...
            _mintYard(msg.sender, projection);
        }
        // if there's egg to withdraw, supply it to the owner...
        if (fish.amount > 0) {
            // mint egg to return to user
            // Need to burn 1/12 when withdrawing (breakage fee)
            uint256 afterBurned = (fish.amount * 11) / 12;
            Fish fishContract = Fish(FISH_CONTRACT);
            fishContract.mintFish(msg.sender, afterBurned);
            emit UnstakedFish(msg.sender, afterBurned);
        }
        // Internal: removes egg from storage.
        _unstakingFish(msg.sender);
    }

    /**
     * Internal: removes egg from storage.
     */
    function _unstakingFish(address user) internal {
        FishStake memory fish = fishStakeHolders[user];
        // NOTE when whould address be zero?
        require(fish.user != address(0), "EMPTY ADDRESS");
        totalFishStaked = totalFishStaked - fish.amount;
        _removeUserFromFishEnumeration(user);
        delete fishStakeHolders[user];
        emit FishUnStaked(user, fish.amount);
    }

    /**
     * Feeds the chikn the amount of Feed.
     */
    function feedYard(uint256 tokenId, uint256 amount) external {
        // check: amount is gt zero...
        require(amount > 0, "MUST BE MORE THAN 0 FEED");

        IERC721 instance = IERC721(CAPTAIN_CONTRACT);

        // check: msg.sender is chikn owner...
        require(instance.ownerOf(tokenId) == msg.sender, "NOT OWNER");
        
        // check: user has enough feed in wallet...
        require(balanceOf(msg.sender) >= amount, "NOT ENOUGH FEED");
        
        // TODO should this be moved to egg contract? or does the order here, matter?
        Fish fishContract = Fish(FISH_CONTRACT);
        (uint24 ton, , , , ) = fishContract.stakedCaptain(tokenId);
        require(ton > 0, "NOT STAKED for feedYard");

        // burn feed...
        _burn(msg.sender, amount*1e18);
        emit Burned(msg.sender, amount*1e18);

        // update eatenAmount in FISH contract...
        fishContract.feedCaptain(tokenId, amount);
    }

    // Moved "levelup" to the EggV2 contract - it doesn't need anything from Feed contract.

    // Moved "skipCoolingOff" to the EggV2 contract - it doesn't need anything from Feed contract.

    function swapFishForFeed(uint256 fishAmt) external {
        require(fishAmt > 0, "MUST BE MORE THAN 0 FISH");

        // burn fish...
        Fish fishContract = Fish(FISH_CONTRACT);
        fishContract.burnFish(msg.sender, fishAmt);

        // supply feed...
        _mint(msg.sender, fishAmt * 1e18 * FEED_SWAP_FACTOR);
        emit FishSwap(msg.sender, fishAmt * 1e18 * FEED_SWAP_FACTOR);
    }

    /**
     * Internal: mints the feed to the given wallet.
     */
    function _mintYard(address sender, uint256 yardAmount) internal {
        // check: that the total Feed supply hasn't been exceeded.
        require(totalSupply() + yardAmount < MAX_FEED_SUPPLY, "OVER MAX SUPPLY");
        _mint(sender, yardAmount*1e18);
        emit Minted(sender, yardAmount*1e18);
    }

    // ADMIN FUNCTIONS

    /**
     * Admin : mints the feed to the given wallet.
     */
    function mintFeed(address sender, uint256 amount) external  {
        _mintYard(sender, amount);
    }

    /**
     * Admin : used for temporarily multipling how much feed is distributed per staked egg.
     */
    function updateBoosterMultiplier(uint256 _value) external  {
        BOOSTER_MULTIPLIER = _value;
    }

    /**
     * Admin : updates how much feed you get per staked egg (e.g. 3x).
     */
    function updateFarmingFactor(uint256 _value) external  {
        FEED_FARMING_FACTOR = _value;
    }

    /**
     * Admin : updates the multiplier for swapping (burning) egg for feed (e.g. 12x).
     */
    function updateFeedSwapFactor(uint256 _value) external  {
        FEED_SWAP_FACTOR = _value;
    }

    /**
     * Admin : updates the maximum available feed supply.
     */
    function updateMaxFeedSupply(uint256 _value) external  {
        MAX_FEED_SUPPLY = _value;
    }

    /**
     * Admin : util for working out how many people are staked.
     */
    function totalFishHolder() public view returns (uint256) {
        return _allFishStakeHolders.length;
    }

    /**
     * Admin : gets the wallet for the the given index. Used for rebalancing.
     */
    function getFishHolderByIndex(uint256 index) internal view returns (address){
        return _allFishStakeHolders[index];
    }

    /**
     * Admin : Rebalances the pool. Mint to the user's wallet. Only called if changing multiplier.
     */
    function rebalanceStakingPool(uint256 from, uint256 to) external  {
        // for each holder of staked Fish...
        for (uint256 i = from; i <= to; i++) {
            address holderAddress = getFishHolderByIndex(i);

            // check how much feed is claimable...
            uint256 pendingClaim = claimableView(holderAddress);
            FishStake memory fish = fishStakeHolders[holderAddress];

            // supply Feed to the owner's wallet...
            _mint(holderAddress, pendingClaim);
            emit Minted(holderAddress, pendingClaim);

            // pdates user's amount of staked eggs to the given value. Resets the "since" timestamp.
            _upsertFishStaking(holderAddress, fish.amount*1e18);
        }
    }
}