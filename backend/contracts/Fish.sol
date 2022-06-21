//SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "./Authorizable.sol";
import "./Captain.sol";

import "hardhat/console.sol";

contract Fish is ERC20, Authorizable {
    using SafeMath for uint256;
    string private TOKEN_NAME = "FISH";
    string private TOKEN_SYMBOL = "FISH";

    address public CAPTAIN_CONTRACT;

    // the base number of $EGG per chikn (i.e. 0.75 $egg)
    uint256 public BASE_HOLDER_FISH = 750000000000000000;

    // the number of $EGG per chikn per day per kg (i.e. 0.25 $egg /chikn /day /kg)
    uint256 public FISH_PER_DAY_PER_TON = 250000000000000000;

    // how much egg it costs to skip the cooldown
    uint256 public COOLDOWN_BASE = 100000000000000000000; // base 100
    // how much additional egg it costs to skip the cooldown per kg
    uint256 public COOLDOWN_BASE_FACTOR = 100000000000000000000; // additional 100 per kg
    // how long to wait before skip cooldown can be re-invoked
    uint256 public COOLDOWN_CD_IN_SECS = 86400; // additional 100 per kg

    uint256 public LEVELING_BASE = 25;
    uint256 public LEVELING_RATE = 2;
    uint256 public COOLDOWN_RATE = 3600; // 60 mins

    // uint8 (0 - 255)
    // uint16 (0 - 65535)
    // uint24 (0 - 16,777,216)
    // uint32 (0 - 4,294,967,295)
    // uint40 (0 - 1,099,511,627,776)
    // unit48 (0 - 281,474,976,710,656)
    // uint256 (0 - 1.157920892e77)

    /**
     * Stores staked chikn fields (=> 152 <= stored in order of size for optimal packing!)
     */
    struct StakedCaptainObj {
        // the current kg level (0 -> 16,777,216)
        uint24 ton;
        // when to calculate egg from (max 20/02/36812, 11:36:16)
        uint32 sinceTs;
        // for the skipCooldown's cooldown (max 20/02/36812, 11:36:16)
        uint32 lastSkippedTs;
        // how much this chikn has been fed (in whole numbers)
        uint48 eatenAmount;
        // cooldown time until level up is allow (per kg)
        uint32 cooldownTs;
    }

    // redundant struct - can't be packed? (max totalKg = 167,772,160,000)
    uint40 public totalTon;
    uint16 public totalStakedCaptain;

    StakedCaptainObj[100001] public stakedCaptain;

    // Events

    event Minted(address owner, uint256 fishAmt);
    event Burned(address owner, uint256 fishAmt);
    event Staked(uint256 tid, uint256 ts);
    event UnStaked(uint256 tid, uint256 ts);

    // Constructor

    constructor(address _captainContract) ERC20(TOKEN_NAME, TOKEN_SYMBOL) {
        CAPTAIN_CONTRACT = _captainContract;
    }

    // "READ" Functions
    // How much is required to be fed to level up per kg

    function feedLevelingRate(uint256 ton) public view returns (uint256) {
        // need to divide the kg by 100, and make sure the feed level is at 18 decimals
        return LEVELING_BASE * ((ton / 100)**LEVELING_RATE);
    }

    // when using the value, need to add the current block timestamp as well
    function cooldownRate(uint256 ton) public view returns (uint256) {
        // need to divide the kg by 100

        return (ton / 100) * COOLDOWN_RATE;
    }

    // Staking Functions

    // stake chikn, check if is already staked, get all detail for chikn such as
    function _stake(uint256 tid) internal {

        Captain captainContract = Captain(CAPTAIN_CONTRACT);

        // verify user is the owner of the chikn...
        require(captainContract.ownerOf(tid) == msg.sender, "NOT OWNER");

        // get calc'd values...
        (, , , , , , , uint256 ton) = captainContract.allCaptainDetails(tid);
        // if lastSkippedTs is 0 its mean it never have a last skip timestamp
        StakedCaptainObj memory captain = stakedCaptain[tid];
        uint32 ts = uint32(block.timestamp);
        if (stakedCaptain[tid].ton == 0) {
            // create staked chikn...
            stakedCaptain[tid] = StakedCaptainObj(
                uint24(ton),
                ts,
                captain.lastSkippedTs > 0 ? captain.lastSkippedTs :  uint32(ts - COOLDOWN_CD_IN_SECS),
                uint48(0),
                uint32(ts) + uint32(cooldownRate(ton)) 
            );

            // update snapshot values...
            // N.B. could be optimised for multi-stakes - but only saves 0.5c AUD per chikn - not worth it, this is a one time operation.
            totalStakedCaptain += 1;
            totalTon += uint24(ton);

            // let ppl know!
            emit Staked(tid, block.timestamp);
        }
    }

    // function staking(uint256 tokenId) external {
    //     _stake(tokenId);
    // }

    function stake(uint256[] calldata tids) external {
        for (uint256 i = 0; i < tids.length; i++) {
            _stake(tids[i]);
        }
    }

    /**
     * Calculates the amount of egg that is claimable from a chikn.
     */
    function claimableView(uint256 tokenId) public view returns (uint256) {
        StakedCaptainObj memory captain = stakedCaptain[tokenId];
        if (captain.ton > 0) {
            uint256 fishPerDay = ((FISH_PER_DAY_PER_TON * (captain.ton / 100)) + BASE_HOLDER_FISH);
            uint256 deltaSeconds = block.timestamp - captain.sinceTs;
            return deltaSeconds * (fishPerDay / 86400);
        } else {
            return 0;
        }
    }

    // Removed "getChikn" to save space

    // struct ChiknObj {
    //     uint256 kg;
    //     uint256 sinceTs;
    //     uint256 lastSkippedTs;
    //     uint256 eatenAmount;
    //     uint256 cooldownTs;
    //     uint256 requireFeedAmount;
    // }

    // function getChikn(uint256 tokenId) public view returns (ChiknObj memory) {
    //     StakedChiknObj memory c = stakedChikn[tokenId];
    //     return
    //         ChiknObj(
    //             c.kg,
    //             c.sinceTs,
    //             c.lastSkippedTs,
    //             c.eatenAmount,
    //             c.cooldownTs,
    //             feedLevelingRate(c.kg)
    //         );
    // }

    /**
     * Get all MY staked chikn id
     */

    function myStakedCaptain() public view returns (uint256[] memory) {
        Captain captainContract = Captain(CAPTAIN_CONTRACT);
        uint256 captainCount = captainContract.balanceOf(msg.sender);
        uint256[] memory tokenIds = new uint256[](captainCount);
        uint256 counter = 0;
        for (uint256 i = 0; i < captainCount; i++) {
            uint256 tokenId = captainContract.tokenOfOwnerByIndex(msg.sender, i);
            StakedCaptainObj memory captain = stakedCaptain[tokenId];
            if (captain.ton > 0) {
                tokenIds[counter] = tokenId;
                counter++;
            }
        }
        return tokenIds;
    }

    /**
     * Calculates the TOTAL amount of egg that is claimable from ALL chikns.
     */
    function myClaimableView() public view returns (uint256) {
        Captain captainContract = Captain(CAPTAIN_CONTRACT);
        uint256 cnt = captainContract.balanceOf(msg.sender);
        require(cnt > 0, "NO CHIKN");
        uint256 totalClaimable = 0;
        for (uint256 i = 0; i < cnt; i++) {
            uint256 tokenId = captainContract.tokenOfOwnerByIndex(msg.sender, i);
            StakedCaptainObj memory captain = stakedCaptain[tokenId];
            // make sure that the token is staked
            if (captain.ton > 0) {
                uint256 claimable = claimableView(tokenId);
                if (claimable > 0) {
                    totalClaimable = totalClaimable + claimable;
                }
            }
        }
        return totalClaimable;
    }

    /**
     * Claims fish from the provided captain.
     */
    function _claimFish(uint256[] calldata tokenIds) internal {

        Captain captainContract = Captain(CAPTAIN_CONTRACT);
        uint256 totalClaimableFish = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(captainContract.ownerOf(tokenIds[i]) == msg.sender, "NOT OWNER");
            StakedCaptainObj memory captain = stakedCaptain[tokenIds[i]];
            // we only care about chikn that have been staked (i.e. kg > 0) ...
            if (captain.ton > 0) {
                uint256 claimableFish = claimableView(tokenIds[i]);
                if (claimableFish > 0) {
                    totalClaimableFish = totalClaimableFish + claimableFish;
                    // reset since, for the next calc...
                    captain.sinceTs = uint32(block.timestamp);
                    stakedCaptain[tokenIds[i]] = captain;
                }
            }
        }
        if (totalClaimableFish > 0) {
            _mint(msg.sender, totalClaimableFish);
            emit Minted(msg.sender, totalClaimableFish);
        }
    }

    /**
     * Claims fish from the provided captain.
     */
    function claimFish(uint256[] calldata tokenIds) external {
        _claimFish(tokenIds);
    }

    /**
     * Unstakes a captain. Why you'd call this, I have no idea.
     */
    function _unstake(uint256 tokenId) internal {
  

        Captain captainContract = Captain(CAPTAIN_CONTRACT);
        

        // verify user is the owner of the captain...
        require(captainContract.ownerOf(tokenId) == msg.sender, "NOT OWNER");

        // update captain...
        StakedCaptainObj memory captain = stakedCaptain[tokenId];
        if (captain.ton > 0) {
            // update snapshot values...
            totalTon -= uint24(captain.ton);
            totalStakedCaptain -= 1;

            captain.ton = 0;
            stakedCaptain[tokenId] = captain;

            // let ppl know!
            emit UnStaked(tokenId, block.timestamp);
        }
    }

    function _unstakeMultiple(uint256[] calldata tids) internal {
        for (uint256 i = 0; i < tids.length; i++) {
            _unstake(tids[i]);
        }
    }

    /**
     * Unstakes MULTIPLE captain. Why you'd call this, I have no idea.
     */
    function unstake(uint256[] calldata tids) external {
        _unstakeMultiple(tids);
    }

    /**
     * Unstakes MULTIPLE chikn AND claims the fish.
     */
    function withdrawAllCaptainAndClaim(uint256[] calldata tids) external {
        _claimFish(tids);
        _unstakeMultiple(tids);
    }

    /**
     * Public : update the chikn's KG level.
     */
     function levelUpCaptain(uint256 tid) external {
        StakedCaptainObj memory captain = stakedCaptain[tid];
        require(captain.ton > 0, "NOT STAKED CAPTAIN FOR levelUpChikn");

  

        Captain captainContract = Captain(CAPTAIN_CONTRACT);
        // NOTE Does it matter if sender is not owner?
         //require(x.ownerOf(chiknId) == msg.sender, "NOT OWNER");

        // check: chikn has eaten enough...
        require(captain.eatenAmount  >= feedLevelingRate(captain.ton), "MORE FISH REQD");
        // check: cooldown has passed...
        require(block.timestamp >= captain.cooldownTs, "COOLDOWN NOT MET");

        // increase kg, reset eaten to 0, update next feed level and cooldown time
        
        captain.ton = captain.ton + 100;
        captain.eatenAmount = 0;
        captain.cooldownTs = uint32(block.timestamp + cooldownRate(captain.ton));
        stakedCaptain[tid] = captain;
        

        // need to increase overall size
        totalTon += uint24(100);

        // and update the chikn contract
        captainContract.setTon(tid, captain.ton);
    }

    /**
     * Internal: burns the given amount of eggs from the wallet.
     */
    function _burnFish(address sender, uint256 fishAmount) internal {
        // NOTE do we need to check this before burn?
        require(balanceOf(sender) >= fishAmount, "NOT ENOUGH FISH");
        _burn(sender, fishAmount*1e18);
        emit Burned(sender, fishAmount*1e18);
    }

    /**
     * Burns the given amount of eggs from the sender's wallet.
     */
    function burnFish(address sender, uint256 fishAmount) external  {
        _burnFish(sender, fishAmount);
    }

    /**
     * Skips the "levelUp" cooling down period, in return for burning Egg.
     */
     function skipCoolingOff(uint256 tokenId, uint256 fishAmt) external {
        StakedCaptainObj memory captain = stakedCaptain[tokenId];
        require(captain.ton != 0, "NOT STAKED FOR skipCoolingOff");

        uint32 ts = uint32(block.timestamp);

        // NOTE Does it matter if sender is not owner?
        // ChickenRunV4 instance = ChickenRunV4(CHIKN_CONTRACT);
        // require(instance.ownerOf(chiknId) == msg.sender, "NOT OWNER");

        // check: enough egg in wallet to pay
        uint256 walletBalance = balanceOf(msg.sender);
        require( walletBalance >= fishAmt * 1e18, "NOT ENOUGH FISH IN WALLET");

        // check: provided egg amount is enough to skip this level
        require(fishAmt * 1e18 >= checkSkipCoolingOffAmt(captain.ton), "NOT ENOUGH FISH TO SKIP");

        // check: user hasn't skipped cooldown in last 24 hrs
        require((captain.lastSkippedTs + COOLDOWN_CD_IN_SECS) <= ts, "BLOCKED BY 24HR COOLDOWN");

        // burn fish
        _burnFish(msg.sender, fishAmt);

        // disable cooldown
        captain.cooldownTs = ts;
        // track last time cooldown was skipped (i.e. now)
        captain.lastSkippedTs = ts;
        stakedCaptain[tokenId] = captain;
    }

    /**
     * Calculates the cost of skipping cooldown.
     */
    function checkSkipCoolingOffAmt(uint256 ton) public view returns (uint256) {
        // NOTE cannot assert KG is < 100... we can have large numbers!
        return ((ton / 100) * COOLDOWN_BASE_FACTOR);
    }

    /**
     * Feed Feeding the chikn
     */
    function feedCaptain(uint256 tokenId, uint256 yardAmount)
        external
        
    {
        StakedCaptainObj memory captain = stakedCaptain[tokenId];
        require(captain.ton > 0, "NOT STAKED FOR feedCaptain");
        require(yardAmount > 0, "NOTHING TO FEED");
        // update the block time as well as claimable
        captain.eatenAmount = uint48(yardAmount) + captain.eatenAmount;
        stakedCaptain[tokenId] = captain;
    }

    // NOTE What happens if we update the multiplier, and people have been staked for a year...?
    // We need to snapshot somehow... but we're physically unable to update 10k records!!!

    // Removed "updateBaseEggs" - to make space

    // Removed "updateEggPerDayPerKg" - to make space

    // ADMIN: to update the cost of skipping cooldown
    function updateSkipCooldownValues(
        uint256 a, 
        uint256 b, 
        uint256 c,
        uint256 d,
        uint256 e
    ) external  {
        COOLDOWN_BASE = a;
        COOLDOWN_BASE_FACTOR = b;
        COOLDOWN_CD_IN_SECS = c;
        BASE_HOLDER_FISH = d;
        FISH_PER_DAY_PER_TON = e;
    }

    // INTRA-CONTRACT: use this function to mint egg to users
    // this also get called by the FEED contract
    function mintFish(address sender, uint256 amount) external  {
        _mint(sender, amount*1e18);
        emit Minted(sender, amount*1e18);
    }

 

    // ADMIN: drop egg to the given chikn wallet owners (within the chiknId range from->to).
    function airdropToExistingHolder(
        uint256 from,
        uint256 to,
        uint256 amountOfFish
    ) external  {
        // mint 1 fish to every owners


        Captain captainContract = Captain(CAPTAIN_CONTRACT);
        for (uint256 i = from; i <= to; i++) {
            address currentOwner = captainContract.ownerOf(i);
            if (currentOwner != address(0)) {
                _mint(currentOwner, amountOfFish * 1e18);
               
            }
        }
    }

    // ADMIN: Rebalance user wallet by minting egg (within the chiknId range from->to).
    // NOTE: This is use when we need to update egg production
    function rebalanceEggClaimableToUserWallet(uint256 from, uint256 to)
        external
        
    {
       
        
        Captain captainContract = Captain(CAPTAIN_CONTRACT);
        for (uint256 i = from; i <= to; i++) {
            address currentOwner = captainContract.ownerOf(i);
            StakedCaptainObj memory captain = stakedCaptain[i];
            // we only care about chikn that have been staked (i.e. kg > 0) ...
            if (captain.ton > 0) {
                _mint(currentOwner, claimableView(i));
                captain.sinceTs = uint32(block.timestamp);
                stakedCaptain[i] = captain;
            }
        }
    }
}