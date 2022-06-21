const { createAlchemyWeb3 } = require('@alch/alchemy-web3')

const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
import { stringify } from 'querystring'
import { config } from '../dapp.config'




const contract = require('../backend/artifacts/contracts/Captain.sol/Captain.json')



const captainAbi= require('../backend/artifacts/contracts/Captain.sol/Captain.json')
const fishAbi = require('../backend/artifacts/contracts/Fish.sol/Fish.json')
const yardAbi = require('../backend/artifacts/contracts/Yard.sol/Yard.json')

const captainContract = new web3.eth.Contract(captainAbi.abi, config.captainContractAddress)
const fishContract = new web3.eth.Contract(fishAbi.abi, config.fishContractAddress)
const yardContract = new web3.eth.Contract(yardAbi.abi, config.yardContractAddress)


export const getCaptainBalanceOf = async (myAdress:any) => {
    const captainBalance = await  captainContract.methods.balanceOf(myAdress).call()
    return captainBalance;

}

export const getFishBalanceOf = async (myAdress:any) => {
    const fishBalance = await  fishContract.methods.balanceOf(myAdress).call()
    console.log(fishBalance)
    return fishBalance;
    
}

export const getYardBalanceOf = async (myAdress:any) => {
    const yardBalance = await  yardContract.methods.balanceOf(myAdress).call()
    return yardBalance;
    
}


export const getCheckSkipCoolingOffAmt = async (ton:any) => {
  const skipcoolingAmount = await  fishContract.methods.checkSkipCoolingOffAmt(ton).call()
  return skipcoolingAmount;
  
}

export const getTotalTonOfAllCaptain = async () => {

  const totalTon = await  fishContract.methods.totalTon().call()/100
  return totalTon;
     

}


export const getCaptionUnstakeDetails = async (myAdress:any) => {

  const captainUnstakeList = await  getUnstakeList(myAdress)

  type CaptainDetails = {
    tokenId: number;
    mintedBy: string;
    currentOwner: string;
    previousPrice: number;
    numberOfTransfers: number;
    forSale: boolean;
    ton: number;
  }

  type CaptainListDetails = {
    ton: number;
    tokenId: number;
    estEgg: number;
    levelUp: number;
    skipTime: number;
  }


  let captainListUnstakeDetailsArray: CaptainListDetails[] = []


  for(let i=0;i <= captainUnstakeList.length; i++ ) {

    console.log("captainUnstakeList:", captainUnstakeList[i])

    

    


       
  }

  return captainUnstakeList; 


}



export const getCaptionStakeDetails = async (myAdress:any) => {

  
  const captainStakeList = await  getStakeList(myAdress)


  type StakedCaptainObj = {
    ton: number;
    sinceTs: number;
    lastSkippedTs: number;
    eatenAmount: number;
    cooldownTs: number;
  }
  
  type CaptainDetails = {
    tokenId: number;
    mintedBy: string;
    currentOwner: string;
    previousPrice: number;
    numberOfTransfers: number;
    forSale: boolean;
    ton: number;
  }

  type CaptainListDetails = {
    ton: number;
    tokenId: number;
    estEgg: number;
    levelUp: number;
    skipTime: number;
  }

  let captainListDetailsArray: CaptainListDetails[] = []

  for(let i=1;i <= captainStakeList.length; i++ ) {
    const captainDetails:CaptainDetails  = await  captainContract.methods.allCaptainDetails(i).call()
    const estEgg = await getEstFishPerDay(captainDetails.ton)
    const levelUp = await  fishContract.methods.feedLevelingRate(captainDetails.ton).call()
    const skipUp = await  fishContract.methods.cooldownRate(captainDetails.ton).call()
    
    captainListDetailsArray.push({
      ton: Number(captainDetails.ton),
      tokenId: Number(i),
      estEgg: Number(estEgg),
      levelUp: Number(levelUp),
      skipTime: Number(skipUp)
    })


       
  }

  //const captainDetails:CaptainDetails  = await  captainContract.methods.allCaptainDetails(tokenId).call()

  //console.log("evet girdi...")

  //return captainDetails;
  return captainListDetailsArray;

}


//first
export const getUnstakeList = async (myAdress:any) => {

  const captainBalance = await  captainContract.methods.balanceOf(myAdress).call()
  let unStakeTokenIds: number[] = []
  let counter: number = 0;

  type StakedCaptainObj = {
    ton: number;
    sinceTs: number;
    lastSkippedTs: number;
    eatenAmount: number;
    cooldownTs: number;
  }

  for (let i=0; i <captainBalance; i++) {
    const tokenId = await  captainContract.methods.tokenOfOwnerByIndex(myAdress,i).call()
    const stakedCaptainObj:StakedCaptainObj = await  fishContract.methods.stakedCaptain(tokenId).call()
    if(Number(stakedCaptainObj.ton)==0) {
      unStakeTokenIds[counter] = Number(tokenId);
      counter++;
    }

  }


    return unStakeTokenIds;

}


export const feedYard = async (tokenId:number, amount:number) => {
    

  if (!window.ethereum.selectedAddress) {
    console.log(window.ethereum)
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }
  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )
  const tx = {
    to: config.yardContractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.price * 0), 'ether')
    ).toString(16), // hex
    data: yardContract.methods.feedYard(tokenId,amount).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    return {
      success: true,
      status: 'success'
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }

}

export const stakeEggForFeed = async (amount:number) =>  {

  
  if (!window.ethereum.selectedAddress) {
    console.log(window.ethereum)
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }
  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )
  const tx = {
    to: config.yardContractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.price * 0), 'ether')
    ).toString(16), // hex
    data: yardContract.methods.staking(amount).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    return {
      success: true,
      status: 'success'
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }

}



export const skipTimeForLevel = async (tokenId:any, fishAmount:any) =>  {

  
  if (!window.ethereum.selectedAddress) {
    console.log(window.ethereum)
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }
  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )
  const tx = {
    to: config.fishContractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.price * 0), 'ether')
    ).toString(16), // hex
    data: fishContract.methods.skipCoolingOff(tokenId,fishAmount).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    return {
      success: true,
      status: 'success'
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }

}


export const unstakeEggForFeed = async (amount:number) =>  {

  
  if (!window.ethereum.selectedAddress) {
    console.log(window.ethereum)
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }
  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )
  const tx = {
    to: config.yardContractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.price * 0), 'ether')
    ).toString(16), // hex
    data: yardContract.methods.withdrawEgg(amount).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    return {
      success: true,
      status: 'success'
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }

}


export const swapFishForFeed = async (amount:number) =>  {

  
  if (!window.ethereum.selectedAddress) {
    console.log(window.ethereum)
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }
  const nonce = await web3.eth.getTransactionCount(
    window.ethereum.selectedAddress,
    'latest'
  )
  const tx = {
    to: config.yardContractAddress,
    from: window.ethereum.selectedAddress,
    value: parseInt(
      web3.utils.toWei(String(config.price * 0), 'ether')
    ).toString(16), // hex
    data: yardContract.methods.swapFishForFeed(amount).encodeABI(),
    nonce: nonce.toString(16)
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })

    return {
      success: true,
      status: 'success'
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }

}


export const getEstDailyFeed = async (myAdress:any) =>  {

  const stakedFish = (await getYourStakedFish(myAdress)).amount;
  const feedFarmingFactor = await  yardContract.methods.FEED_FARMING_FACTOR().call()
  const estDailyFeed = (stakedFish * feedFarmingFactor)
  return estDailyFeed;

}

export const getYourStakedFish = async (myAdress:any) =>  {


  type FishStateHolders = {
    user: string;
    since: number;
    amount: number;
  }

  const fishStateHolders:FishStateHolders = await  yardContract.methods.fishStakeHolders(myAdress).call()


  return fishStateHolders;


}


export const getFeedActivity = async (myAdress:any) => {

  type StakedCaptainObj = {
    ton: number;
    sinceTs: number;
    lastSkippedTs: number;
    eatenAmount: number;
    cooldownTs: number;
  }


   type FeedActivityObj = {
     tokenId: number;
     levelUp: number;
     skipUp: number;
   }

  const captainStakeList =  await getStakeList(myAdress)

 // let feedActivityObjArray = new Map<number, FeedActivityObj>();

  let feedActivitySrtArray: FeedActivityObj[] = []




    for(let i=0; i<captainStakeList.length; i++) {

      const stakedCaptainObj:StakedCaptainObj = await  fishContract.methods.stakedCaptain(captainStakeList[i]).call()
      const levelUp = await  fishContract.methods.feedLevelingRate(stakedCaptainObj.ton).call()
      const skipUp = await  fishContract.methods.cooldownRate(stakedCaptainObj.ton).call()

      feedActivitySrtArray.push({
        tokenId: Number(captainStakeList[i]),
        levelUp: Number(levelUp),
        skipUp: Number(skipUp)
      })

      /*
      feedActivityObjArray.set(Number(captainStakeList[i]),{tokenId: Number(captainStakeList[i]), levelUp: Number(levelUp), 
        skipUp: Number(skipUp)})
        */

    }


 
    /*
  captainStakeList.forEach(async function (tokenId) {

      const stakedCaptainObj:StakedCaptainObj = await  fishContract.methods.stakedCaptain(tokenId).call()
      const levelUp = await  fishContract.methods.feedLevelingRate(stakedCaptainObj.ton).call()
      const skipUp = await  fishContract.methods.cooldownRate(stakedCaptainObj.ton).call()

  
       feedActivityObjArray.set(Number(tokenId),{tokenId: Number(tokenId), levelUp: Number(levelUp), skipUp: Number(skipUp)})


      
        
    }); 
    */


    //console.log(feedActivitySrtArray[0].tokenId)
    //return feedActivitySrtArray.push(feedActivityObjArray);
    return feedActivitySrtArray;
}


export const getEatenAmount = async (myAddress:any) => {

  const captainBalance = await  captainContract.methods.balanceOf(myAddress).call()

  let stakeEatenAmounts: number[] = []
  let counter: number = 0;
  
  type StakedCaptainObj = {
    ton: number;
    sinceTs: number;
    lastSkippedTs: number;
    eatenAmount: number;
    cooldownTs: number;
  }


  for (let i=0; i <captainBalance; i++) {
    const tokenId = await  captainContract.methods.tokenOfOwnerByIndex(myAddress,i).call()
    const stakedCaptainObj:StakedCaptainObj = await  fishContract.methods.stakedCaptain(tokenId).call()
    //console.log(tokenId)
    //console.log(stakedCaptainObj.ton)
    if(stakedCaptainObj.ton>0) {
      stakeEatenAmounts[counter] = stakedCaptainObj.eatenAmount;
      counter++;
    }

  }

  return stakeEatenAmounts;
    
}


export const getStakeList = async (myAdress:any) => {

  const captainBalance = await  captainContract.methods.balanceOf(myAdress).call()

  

  let stakeTokenIds: number[] = []
  let counter: number = 0;




  type StakedCaptainObj = {
    ton: number;
    sinceTs: number;
    lastSkippedTs: number;
    eatenAmount: number;
    cooldownTs: number;
  }

  let feedActivitySrtArray: FeedActivityObj[] = []

  for (let i=0; i <captainBalance; i++) {
    const tokenId = await  captainContract.methods.tokenOfOwnerByIndex(myAdress,i).call()
    const stakedCaptainObj:StakedCaptainObj = await  fishContract.methods.stakedCaptain(tokenId).call()
    //console.log(tokenId)
    //console.log(stakedCaptainObj.ton)
    if(stakedCaptainObj.ton>0) {
      stakeTokenIds[counter] = Number(tokenId);
      counter++;
    }

  }

    return stakeTokenIds;

}


export const unStakeAll = async (myAdress:any) => {

  let stakeTokenIds = await getStakeList(myAdress)
  console.log(stakeTokenIds)

   await unstake(stakeTokenIds);

}



export const stakeAll = async (myAdress:any) => {

    let unStakeTokenIds = await getUnStakeList(myAdress)
    console.log(unStakeTokenIds)

   await stake(unStakeTokenIds);

}


export const stakeCaptain = async (unStakeTokenIds:number[]) => {


  if (!window.ethereum.selectedAddress) {
      console.log(window.ethereum)
      return {
        success: false,
        status: 'To be able to mint, you need to connect your wallet'
      }
    }
    const nonce = await web3.eth.getTransactionCount(
      window.ethereum.selectedAddress,
      'latest'
    )
    const tx = {
      to: config.fishContractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * 0), 'ether')
      ).toString(16), // hex
      data: fishContract.methods.stake(unStakeTokenIds).encodeABI(),
      nonce: nonce.toString(16)
    }
  
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })
  
      return {
        success: true,
        status: 'success'
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }


}


export const unstakeCaptain = async (StakeTokenIds:number[]) => {


  if (!window.ethereum.selectedAddress) {
      console.log(window.ethereum)
      return {
        success: false,
        status: 'To be able to mint, you need to connect your wallet'
      }
    }
    const nonce = await web3.eth.getTransactionCount(
      window.ethereum.selectedAddress,
      'latest'
    )
    const tx = {
      to: config.fishContractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * 0), 'ether')
      ).toString(16), // hex
      data: fishContract.methods.unstake(StakeTokenIds).encodeABI(),
      nonce: nonce.toString(16)
    }
  
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })
  
      return {
        success: true,
        status: 'success'
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }


}




export const levelUpCaptain = async (tokenId:any) => {


  if (!window.ethereum.selectedAddress) {
      console.log(window.ethereum)
      return {
        success: false,
        status: 'To be able to mint, you need to connect your wallet'
      }
    }
    const nonce = await web3.eth.getTransactionCount(
      window.ethereum.selectedAddress,
      'latest'
    )
    const tx = {
      to: config.fishContractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * 0), 'ether')
      ).toString(16), // hex
      data: fishContract.methods.levelUpCaptain(tokenId).encodeABI(),
      nonce: nonce.toString(16)
    }
  
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })
  
      return {
        success: true,
        status: 'success'
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }


}


export const unstake = async (stakeTokenIds:number[]) => {


  if (!window.ethereum.selectedAddress) {
      console.log(window.ethereum)
      return {
        success: false,
        status: 'To be able to mint, you need to connect your wallet'
      }
    }
    const nonce = await web3.eth.getTransactionCount(
      window.ethereum.selectedAddress,
      'latest'
    )
    const tx = {
      to: config.fishContractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * 0), 'ether')
      ).toString(16), // hex
      data: fishContract.methods.unstake(stakeTokenIds).encodeABI(),
      nonce: nonce.toString(16)
    }
  
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })
  
      return {
        success: true,
        status: 'success'
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }


}



export const claimFish = async (myAdress:any) => {

  const [tokenIds, myFishTotalTon,totalFishClaimable, estEggPerDay]  = await  GetMyStakedCaptain(myAdress)
  

  if (!window.ethereum.selectedAddress) {
      console.log(window.ethereum)
      return {
        success: false,
        status: 'To be able to mint, you need to connect your wallet'
      }
    }
    const nonce = await web3.eth.getTransactionCount(
      window.ethereum.selectedAddress,
      'latest'
    )
    const tx = {
      to: config.fishContractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * 0), 'ether')
      ).toString(16), // hex
      data: fishContract.methods.claimFish(tokenIds).encodeABI(),
      nonce: nonce.toString(16)
    }
  
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })
  
      return {
        success: true,
        status: 'success'
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }

}






export const claimYard = async () => {


  if (!window.ethereum.selectedAddress) {
      console.log(window.ethereum)
      return {
        success: false,
        status: 'To be able to mint, you need to connect your wallet'
      }
    }
    const nonce = await web3.eth.getTransactionCount(
      window.ethereum.selectedAddress,
      'latest'
    )
    const tx = {
      to: config.yardContractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * 0), 'ether')
      ).toString(16), // hex
      data: yardContract.methods.claimYard().encodeABI(),
      nonce: nonce.toString(16)
    }
  
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })
  
      return {
        success: true,
        status: 'success'
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }

}




export const getEstFishPerDay = (myFishTotalTon:number) => {

      let estEggPerDay: number = 0;
      estEggPerDay =  ((Number(0.25) * (myFishTotalTon/ 100)) + (0.75));
      if(estEggPerDay == 0.75) {
        estEggPerDay = 0;
      } 
      return estEggPerDay;
}







export const GetMyStakedCaptain = async (myAdress:any) => {

  const captainBalance = await  captainContract.methods.balanceOf(myAdress).call()
  let tokenIds: number[] = []

  
  let myFishTotalTon: number = 0;
  let totalFishClaimable : number = 0;
  let estEggPerDay: number = 0;

  
  type StakedCaptainObj = {
    ton: number;
    sinceTs: number;
    lastSkippedTs: number;
    eatenAmount: number;
    cooldownTs: number;
  }

  for (let i=0; i <captainBalance; i++) {
    const tokenId = await  captainContract.methods.tokenOfOwnerByIndex(myAdress,i).call()
    const stakedCaptainObj:StakedCaptainObj = await  fishContract.methods.stakedCaptain(tokenId).call()
    if(stakedCaptainObj.ton>0) {
     
      tokenIds[i] = Number(tokenId);
      myFishTotalTon = myFishTotalTon + Number(stakedCaptainObj.ton/100);
      const claimable = await  fishContract.methods.claimableView(tokenId).call()
      if(claimable>0) {
        totalFishClaimable = Number(totalFishClaimable + Number(claimable));
      }
       
    }

  }
  
  estEggPerDay = getEstFishPerDay(myFishTotalTon*100);

  return [tokenIds,myFishTotalTon,totalFishClaimable.toFixed(3),estEggPerDay];

}

export const getYardClaimable = async (myAdress:any) => {
  const totalYardClaimAmount = await  yardContract.methods.claimableView(myAdress).call()

  return totalYardClaimAmount/1000000000000000000;

}



export const mintCaptain = async ( mintAmount) => {
    if (!window.ethereum.selectedAddress) {
        console.log(window.ethereum)
        return {
          success: false,
          status: 'To be able to mint, you need to connect your wallet'
        }
      }
      const nonce = await web3.eth.getTransactionCount(
        window.ethereum.selectedAddress,
        'latest'
      )
      const tx = {
        to: config.captainContractAddress,
        from: window.ethereum.selectedAddress,
        value: parseInt(
          web3.utils.toWei(String(config.price * mintAmount), 'ether')
        ).toString(16), // hex
        data: captainContract.methods.mint(mintAmount).encodeABI(),
        nonce: nonce.toString(16)
      }
    
      try {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [tx]
        })
    
        return {
          success: true,
          status: 'success'
        }
      } catch (error) {
        return {
          success: false,
          status: '😞 Smth went wrong:' + error.message
        }
      }

}


export const mintFish = async (sender, mintAmount) => {
  if (!window.ethereum.selectedAddress) {
      console.log(window.ethereum)
      return {
        success: false,
        status: 'To be able to mint, you need to connect your wallet'
      }
    }
    const nonce = await web3.eth.getTransactionCount(
      window.ethereum.selectedAddress,
      'latest'
    )
    const tx = {
      to: config.fishContractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * mintAmount), 'ether')
      ).toString(16), // hex
      data: fishContract.methods.mintFish(sender,mintAmount).encodeABI(),
      nonce: nonce.toString(16)
    }
  
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })
  
      return {
        success: true,
        status: 'success'
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }

}


export const mintFeed = async (sender, mintAmount) => {
  if (!window.ethereum.selectedAddress) {
      console.log(window.ethereum)
      return {
        success: false,
        status: 'To be able to mint, you need to connect your wallet'
      }
    }
    const nonce = await web3.eth.getTransactionCount(
      window.ethereum.selectedAddress,
      'latest'
    )
    const tx = {
      to: config.yardContractAddress,
      from: window.ethereum.selectedAddress,
      value: parseInt(
        web3.utils.toWei(String(config.price * mintAmount), 'ether')
      ).toString(16), // hex
      data: yardContract.methods.mintFeed(sender,mintAmount).encodeABI(),
      nonce: nonce.toString(16)
    }
  
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      })
  
      return {
        success: true,
        status: 'success'
      }
    } catch (error) {
      return {
        success: false,
        status: '😞 Smth went wrong:' + error.message
      }
    }

}


export const getTotalSupply = async () => {
    const totalSupply = await  captainContract.methods.totalSupply().call()
    return totalSupply;
  }