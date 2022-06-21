import { NextPage } from "next";
import Head from 'next/head'
import Image from "next/image";

import React, {useEffect,useState} from 'react';

import { ethers } from "ethers";

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

import { 
    getTotalSupply,
    getCaptainBalanceOf,
    getFishBalanceOf,
    getYardBalanceOf,
    mintCaptain,
    GetMyStakedCaptain,
    getTotalTonOfAllCaptain,
    claimFish,
    stakeAll,
    unStakeAll,
    getFeedActivity,
    feedYard,
    getYourStakedFish,
    getEstDailyFeed,
    stakeEggForFeed,
    unstakeEggForFeed,
    swapFishForFeed,
    getYardClaimable,
    getEstFishPerDay,
    getCaptionStakeDetails,
    getCaptionUnstakeDetails,
    claimYard,
    levelUpCaptain,
    getCheckSkipCoolingOffAmt,
    skipTimeForLevel,
    getUnstakeList,
    stakeCaptain,
    unstakeCaptain,
    getStakeList,
    mintFish,
    mintFeed
  } from "../utils/interact"








const Home: NextPage = () => {

    const [loginState,setLoginState] = useState();
    const [isConnected, setIsConnected] = useState(false);
    const [myaddress, setMyAddress] = useState();
    const [captainBalance, setCaptainBalance] = useState(0);
    const [fishBalance, setFishBalance] = useState(0);
    const [yardBalance, setYardBalance] = useState(0);
    const [myCaptainStake,setMyCaptainStake] = useState<number[]>([]);
    const [loading,setLoading] = useState(false);
    const [myFishTotalTon,setMyFishTotalTon] = useState(0);
    const [totalTon,setTotalTon] = useState(0);
    const [totalClaimable,setTotalClaimable] = useState(0);
    const [estEggPerDay ,setEstEggPerDay ] = useState(0);
    const [feedActivity, setFeedActivity] = useState<FeedActivityObj[]>([]);
    const [stakedFish, setStakedFish] = useState<FishStateHolders>({user:'',since:0,amount:0});
    const [estDailyFeed, setEstDailyFeed] = useState(0);
    const [totalYardClaimAmount, setTotalYardClaimAmount] = useState(0);
    const [captainStakeDetails, setCaptainStakeDetails] = useState<CaptainListDetails[]>([]);
    const [captainUnstakeDetails, setCaptainUnstakeDetails] = useState<CaptainListDetails[]>([]);
    const [eggStakeMax,setEggStakeMax]= useState();
    const [yourEstDailyFeedCalc,setYourEstDailyFeedCalc] = useState(0);

    const [eggAmount, setEggAmount] = useState();

    const [stakeEggInput, setStakeEggInput] = useState();
    const [stakeEggInputMax, setStakeEggInputMax] = useState();
    const [stakeFeedInput, setStakeFeedInput] = useState();

    const [unstakeEggInput, setUnstakeEggInput] = useState();
    const [unstakeEggInputMax, setUnstakeEggInputMax] = useState();
    const [unstakeFeedInput, setUnstakeFeedInput] = useState();

    const [swapEggInput, setSwapEggInput] = useState();
    const [swapEggInputMax, setSwapEggInputMax] = useState();
    const [swapFeedInput, setSwapFeedInput] = useState();

    const [unstakeCaptainList, setUnstakeCaptionList] = useState();
    const [stakeCaptainList, setStakeCaptionList] = useState();

    const [captainMintAmount,setCaptainMintAmount] = useState();
    const [fishMintAmount,setFishMintAmount] = useState();
    const [feedMintAmount,setFeedMintAmount] = useState();

    
    useEffect(() => {
      const init = async () => {
        if(myaddress) {
        
       
          setCaptainBalance(await getCaptainBalanceOf(myaddress))
          setFishBalance(((await getFishBalanceOf(myaddress) / 1000000000000000000).toFixed(2)))
          setYardBalance(await getYardBalanceOf(myaddress))
          const [tokenIds, myFishTotalTon,totalFishClaimable, estEggPerDay] =  await GetMyStakedCaptain(myaddress)
          setMyCaptainStake(tokenIds)
          setMyFishTotalTon(myFishTotalTon)
          setTotalClaimable(Number((totalFishClaimable/1000000000000000000).toFixed(2)))
          setEstEggPerDay(estEggPerDay)
          setTotalTon(await getTotalTonOfAllCaptain())
          setFeedActivity(await getFeedActivity(myaddress) )
          setStakedFish(await getYourStakedFish(myaddress))
          setEstDailyFeed(await getEstDailyFeed(myaddress))
  
          setTotalYardClaimAmount( (await getYardClaimable(myaddress)).toFixed(3))
          //console.log(feedActivity[1].levelUp)
          //console.log("getYardClaimable:", await getYardClaimable(myaddress))
          console.log("fishBalance:",fishBalance)
          console.log("myCaptainStake",myCaptainStake)

          setCaptainStakeDetails(await getCaptionStakeDetails(myaddress));
          setCaptainUnstakeDetails(await getCaptionUnstakeDetails(myaddress));
          console.log("Goster captainUnstakeDetails:", captainUnstakeDetails)

          setUnstakeCaptionList(await getUnstakeList(myaddress))
          setStakeCaptionList(await getStakeList(myaddress))

          
   
          setEggStakeMax(Number(fishBalance).toFixed(4))
        
  

    
     
  
  
       
        }
  
      }
  
      init()
  },[myaddress])


  const putStakeEggMax = () => {
      
    setStakeEggInput(Number(fishBalance).toFixed(0))
   //  setEggAmount(Number(fishBalance).toFixed(0))


  }

  const putUnstakeEggMax = () => {
    setUnstakeEggInput(Number(stakedFish.amount))
  }

  const putSwapEggMax = () => {
    setSwapEggInput(Number(fishBalance).toFixed(0))
  }


  const addMaxEggUnstake = () => {

   setEggAmount(fishBalance)


}


  const handleEggStake = (e) => {
    

    setStakeEggInput(e.target.value)


   
    
  } 


  const handleCaptainMint = (e) => {
    

    setCaptainMintAmount(e.target.value)


   
    
  } 


  const handleFishMint = (e) => {
    

    setFishMintAmount(e.target.value)


   
    
  } 

  
  const handleFeedMint = (e) => {
    

    setFeedMintAmount(e.target.value)


   
    
  } 



  const handleEggUnstake = (e) => {
    

    setUnstakeEggInput(e.target.value)


    
  } 

  
  const handleEggSwap = (e) => {
    

    setSwapEggInput(e.target.value)


    
  } 

  async function claimFishFunc() {

    if (typeof window.ethereum !== "undefined") {
      setLoading(true)
       await claimFish(myaddress)
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
 
  }


    async function claimYardFunc() {

    if (typeof window.ethereum !== "undefined") {
      setLoading(true)
       await claimYard()
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
 
  }



  

  const  stakeEggForFeedFunc =  async  (amount:any) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

      

       await stakeEggForFeed(amount)
       console.log(amount)
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }

  const  unstakeEggForFeedFunc =  async  (amount:any) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

      

       await unstakeEggForFeed(amount)
       console.log(amount)
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }

  const  swapFishForFeedFunc =  async  (amount:any) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

      

       await swapFishForFeed(amount)
       console.log(amount)
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }

  const  feedYardFunc =  async  (tokenId:number,amount:any) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

      

       await feedYard(tokenId, amount)

       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }


   const  skipTimeForLevelFunc =  async  (tokenId:number,amount:any) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

 

       await skipTimeForLevel(tokenId, amount)
  
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }

  const  mintCaptainFunc =  async  (myAdress:any,amount:any) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

 

       await mintCaptain(myAdress, amount)
  
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }


  const  mintFishFunc =  async  (myAdress:any,amount:any) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

 

       await mintFish(myAdress, amount)
  
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }

  const  mintFeedFunc =  async  (myAdress:any,amount:any) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

 

       await mintFeed(myAdress, amount)
  
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }


  


  const  levelUpCaptainFunc =  async  (tokenId:number) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

 

       await levelUpCaptain(tokenId)
  
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }

  const  stakeCaptainFunc =  async  (tokenIds:number[]) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

 

       await stakeCaptain(tokenIds)
  
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }


  const  unstakeCaptainFunc =  async  (tokenIds:number[]) =>  {
    
    if (typeof window.ethereum !== "undefined") {
      setLoading(true)

 

       await unstakeCaptain(tokenIds)
  
       setLoading(false)
    } else {
      console.log("Please install MetaMask");
    }
  }






    const checkUser = async () => {
  
      const { data } = await supabase.from("users").select("*")
      console.log(`data`, data[0].walletAddr)
        
    }


    const login = async () => {

        setLoginState("Connecting to your wallet...")
        if(!window.ethereum) {
          setLoginState("No MetaMask Wallet... Please install it");
          return;
        }
    
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts",[]);
        const signer =  provider.getSigner();
        const walletAddr = await signer.getAddress();
    
        setLoginState("Generating nonce....")
    
    
    
        //let  response  = await axios.get('/api/auth/nonce');
        //const nonce =  response.data.nonce;
        //console.log('nonce:', nonce)
    
    
        let  response = await fetch("/api/auth/nonce", {
          method: "POST",
          body: JSON.stringify({
            walletAddr,
          }),
          headers: {
            "Content-Type": "application/json"
          }
        })
    
        const { nonce } = await response.json();
      
    
        setLoginState("Please sign the nonce...");
        const signature = await signer.signMessage(nonce);
       
    
        
          response = await fetch("/api/auth/wallet", {
          method: "POST",
          body: JSON.stringify({
            walletAddr,
            nonce,
            signature
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });
    
        setLoginState("Login completed");
    
        const { user, token  }  = await response.json();
    
      
    
        await  supabase.auth.setAuth(token);
        setIsConnected(true)
        const { data } = await supabase.from("users").select("*")
        setMyAddress(data[0].walletAddr)
    
    
    
      }
    



    return(

      <div>
        {isConnected ? (
        <div>
        <div className="flex justify-end py-4">
        <div className="text-xs">  <b>My Wallet Address:  </b>  </div>
       <div className="text-xs"> {myaddress}</div>
        </div>

       <div>
       <div id="top_section" className="flex justify-between">

<div id="top_left_section" className="flex flex-col py-2">
<div><b>Total KG of your roast</b></div>
<div className="text-red-600"><b>{myFishTotalTon} kg</b></div>
<br/>
<div><b>Total Kg in barn</b></div>
<div className="text-red-600"><b>{totalTon} kg</b></div>
</div>

<div id="top_middle_section" className=" flex flex-col"> 

<div id="genel">
<div>
<div className="flex justify-start">
<div className="text-red-600 flex items-center"><b>{totalClaimable}</b></div>
<div>
   <img 
        className=""
         width="35px"
         height="35px"
         src="/images/egg.svg"
     />
   </div>
   

</div>
<div className="text-sm"><b>EGG TO CLAIM</b></div>
<div>est 2.25 egg a day</div>
<div className="py-5">
   <button 
   onClick={claimFishFunc}
   className="bg-red-600 text-white rounded-full px-10 py-1 text-center text-xs">Egg Claim</button>
</div>
</div>
</div>





</div>

<div id="top_middle_section" className=" flex flex-col"> 
<div className="flex justify-start">
<div className="text-red-600 flex items-center"><b>{totalYardClaimAmount}</b></div>
<div>
   <img 
        className=""
         width="35px"
         height="35px"
         src="/images/feed.svg"
     />
   </div>

</div>

<div className="text-sm"><b>FEED TO CLAIM</b></div>
<div className="py-3"></div>
<div className="py-5">
   <button 
   onClick={claimYardFunc}
   className="bg-red-600 text-white rounded-full px-10 py-1 text-center text-xs">Feed Claim</button>
</div>

</div>


<div id="top_right_section" className=" flex justify-end">

<div className="flex flex-col ">
<div> 
   <div className="flex flex-col items-end">
   
           <div className="flex">
               <div className="text-red-600 flex items-center"><b>{fishBalance}</b></div>
                           <div>
                       <img 
                       className=""
                       width="35px"
                       height="35px"
                       src="/images/egg.svg"
                   />
                   </div>
        
       </div>
       <div className="flex  text-xs"><b>YOUR TOTAL EGG</b></div>
   </div>
</div>
<div className="py-2"></div>
<div> 
   <div className="flex flex-col items-end">
       <div>
           <div className="flex">
               <div className="text-red-700 flex items-center"><b>{Number(stakedFish.amount)}</b></div>
           <div>
   <img 
        className=""
         width="35px"
         height="35px"
         src="/images/egg.svg"
     />
   </div>
           </div>
       </div>
       <div className="flex justify-around text-xs"><b>YOUR STAKED EGG</b></div>
   </div>
</div>
<div className="py-2"></div>
<div> 
   <div className="flex flex-col items-end">
       <div>
           <div className="flex">
               <div className="text-red-700 flex items-center "><b> {Number(estDailyFeed)}</b></div>
           <div>
   <img 
        className=""
         width="35px"
         height="35px"
         src="/images/feed.svg"
     />
   </div>
           </div>
       </div>
       <div className="flex text-xs"><b>EST DAILY FEED</b></div>
   </div>
</div>
<div className="py-2"></div>
</div>
</div>

</div>
       </div>
       <div id="medium" className="flex justify-between">
          <div id="medium_left" className="">
              <div className="flex justify-center bg-green-500 text-white">Captain Staked List</div>
              <div className="flex flex-col">{captainStakeDetails?.length > 0 &&
                      captainStakeDetails.map((item:any,index:number) => (
                            <div className="flex border border-gray-400" key={index}>
                                <div className="py-2">
                                <img 
                         width="50px"
                         height="50px"
                         src={"/images/" + item.tokenId + ".png"}
                       
                     />
                                </div>
                                <div className="py-2 px-2 text-xs">
                           <div>{item.ton} Ton</div>
                           <div>captain #{item.tokenId}</div>
                           <div>est {item.estEgg } egg per day</div>
                           </div>
                           <div className="px-2 text-xs">
                        
                           <div className="flex">
               
                               <div>
                                   <div className="py-3.5">Level Up: {item.levelUp}</div>
                                   <div>SkipTime: {item.skipTime} </div>
                                      <div className="py-3">Level: {item.ton/100} </div>
                               </div>
                          
                        
                             
                           </div>
                       </div>
                       <div className="text-xs px-2">
                                   <div className="py-2">    
                                   <button className="bg-red-600 text-white rounded px-6 py-1 "
                                   onClick={() => feedYardFunc(item.tokenId ,item.levelUp)}
                                   >Feed</button>
                                   </div>
                                   <div>       <button className="bg-red-600 text-white rounded px-6 py-1 "
                                   onClick={() => skipTimeForLevelFunc(item.tokenId,item.skipTime)}
                                   >Skip</button></div>
                                      <div className="py-1">       <button className="bg-red-600 text-white rounded px-3 py-1 "
                                   onClick={() => levelUpCaptainFunc(item.tokenId)}
                                   >Level Up</button></div>
                                           <div className="py-1">       <button className="bg-red-600 text-white rounded px-3 py-1 "
                                   onClick={() => unstakeCaptainFunc([item.tokenId])}
                                   >Unstake</button></div>
                               
                            
                                   </div>
                                  
                            </div>
                              
                      ))}</div>

               <div className="py-6">
                   <div className="flex justify-center bg-green-500 text-white">Captain Unstaked List</div>   
                   <div className="flex flex-col">{captainUnstakeDetails?.length > 0 &&
                      captainUnstakeDetails.map((item:any,index:number) => (
                            <div className="flex border border-gray-400" key={index}>
                                <div className="py-2">
                                <img 
                         width="50px"
                         height="50px"
                         src={"/images/" + item + ".png"}
                       
                     />
                                </div>
                                <div className="py-2 px-2 text-xs">
                           <div></div>
                           <div className="py-3 flex justify-center">captain #{item}</div>
                           <div></div>
                           </div>
                           <div className="px-2 text-xs">
                        
                           <div className="flex">
               
                               <div>
                                   <div className="py-3.5"></div>
                                   <div></div>
                                      <div className="py-3"> </div>
                               </div>
                          
                        
                             
                           </div>
                       </div>
                       <div className="text-xs px-2">
                                   <div className="py-2">    
                                  
                                   </div>
                                   <div>       <button className="bg-red-600 text-white rounded px-6 py-1 "
                                   onClick={() => stakeCaptainFunc([item])}
                                   >Stake</button></div>
                                      <div className="py-1">     </div>
                               
                            
                                   </div>
                                  
                            </div>
                              
                      ))}</div>
               </div>

               <div className="py-6">
                   <div className="flex justify-center bg-green-500 text-white">Mint Operations</div>   
                   <div className="flex flex-col">
                   
                   <div className="flex justify-center py-3">
                      <div className="flex justify-center px-3">
                       <input type='number' className="border-2 border-gray-400-500" 
                       onChange={handleCaptainMint } 
                       value={captainMintAmount}></input>
                       </div>
                       <div><button className="bg-red-600 px-5 rounded-full text-white text-xs  py-3"
                       onClick={() => mintCaptainFunc(captainMintAmount)}
                       >
                         Captain Mint
                         </button></div>
                   </div>
                   <div className="flex justify-center py-3">
                      <div className="flex justify-center px-3">
                       <input type='number' className="border-2 border-gray-400-500" 
                       onChange={handleFishMint } 
                       value={fishMintAmount}></input>
                       </div>
                       <div><button className="bg-red-600 px-5 rounded-full text-white text-xs  py-3"
                          onClick={() => mintFishFunc(myaddress,fishMintAmount)}>
                         Fish Mint
                         </button></div>
                   </div>
                   <div className="flex justify-center py-3">
                      <div className="flex justify-center px-3">
                       <input type='number' className="border-2 border-gray-400-500" 
                       onChange={handleFeedMint } 
                       value={feedMintAmount}></input>
                       </div>
                       <div><button className="bg-red-600 px-5 rounded-full text-white text-xs  py-3"
                       onClick={() => mintFeedFunc(myaddress,feedMintAmount)}
                       >
                         Feed Mint
                         </button></div>
                   </div>
               
                   
                   </div>
               </div>

               
                   
      

          </div>
          <div id="medium_right">
        
              <div>
              <div className="border-2">
                   
       
                   <div className="flex flex-col">
               

                           <div>
                               <div className="bg-green-500 text-white text-center">Stake/Unstake</div>
                               
                           </div>
                           <div className="py-1"></div>
              
                 
                      <div className="bg-red-600 text-white text-center">2x MULTIPLIER</div>
                      <div className="py-2"></div>
                     
                     
              
                   </div>
                       <div className="flex justify-center text-xs" >WHEN YOU STAKE</div>
                       <div className="flex">
                       <div>
                       <img 
                            className="border-2"
                             width="30px"
                             height="30px"
                             src="/images/egg.svg"
                         />
                       </div>
                       <div className="flex">
                       <input type='number' className="border-2 border-gray-400-500" 
                       onChange={handleEggStake } 
                       value={stakeEggInput}></input>
                       </div>

                       <div className="flex">
                       <button className="bg-gray-400 rounded px-4 py-0.5 text-xs" onClick={putStakeEggMax} >Max</button>
                       </div>

                       </div>
                      
                       <div className="flex justify-center">
                   <img 
                            className="align-bottom"
                             width="8px"
                             height="10px"
                             src="/images/downarrow.svg"
                         />
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="text-xs">YOUR EST. DAILY FEED</div>
                      <div className="flex">

                      <div>
                       <img 
                            className="border-2"
                             width="30px"
                             height="30px"
                             src="/images/feed.svg"
                         />
                       </div>
              
                      <div className="flex">
                       <input type='number' className="border-2 border-gray-400-500" 
                  
                       value={  (Number(stakeEggInput)*Number(2)) }
                         ></input>
                       </div>

                    
                   </div>
                   <div className="py-2"></div>
                   <div> 
                       <button
                       onClick={async() => {await stakeEggForFeedFunc(stakeEggInput); }}
                       className="bg-red-600 px-20 rounded-full text-white text-xs  py-3"
                     
                        >Stake Egg</button>
                   </div>

                   </div>
                   <div className="py-3"></div>
                

                   <div>
                   <div className="flex flex-col items-center">
       
                      <div className="py-2"></div>
     

              
                   </div>
                       <div className="flex justify-center text-xs" >WHEN YOU UNSTAKE</div>
                       <div className="flex justify-center">
                       <div>
                       <img 
                            className="border-2"
                             width="30px"
                             height="30px"
                             src="/images/egg.svg"
                         />
                       </div>
                       <div className="flex">
                       <input type='text' className="border-2 border-gray-400-500"
                       onChange={handleEggUnstake}
                       value={unstakeEggInput}
                       ></input>
                       </div>
                       <div className="flex">
                       <button 
                       onClick={putUnstakeEggMax}
                       className="bg-gray-400 rounded px-4 py-0.5 text-xs">Max</button>
                       </div>
                       </div>
                      
                       <div className="flex justify-center">
                   <img 
                            className="align-bottom"
                             width="8px"
                             height="10px"
                             src="/images/downarrow.svg"
                         />
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="text-xs">EST. REDUCTION FEED</div>
                      <div className="flex">
                   <div>
                       <img 
                            className="border-2"
                             width="30px"
                             height="30px"
                             src="/images/feed.svg"
                         />
                       </div>
                    
                       <div className="flex">
                       <input type='number' className="border-2 border-gray-400-500" 
                  
                       value={  (Number(unstakeEggInput)*Number(2)) }
                         ></input>
                       </div>

                    
                   </div>
                   <div className="py-2"></div>
                   <div> 
                       <button 
                       onClick={async() => {await unstakeEggForFeedFunc(unstakeEggInput); }}
                       className="bg-red-600 px-20 rounded-full text-white text-xs  py-3">Unstake Egg</button>
                   </div>

                   </div>

                   </div>
                      
               
                   </div>
              </div>
              <div className="py-5"></div>

              <div>
              <div className="border-2">
                   
       
                   <div className="flex flex-col">
               

                           <div>
                               <div className="bg-green-500 text-white text-center">Swap</div>
                               
                           </div>
                           <div className="py-1"></div>
              
                 
                      <div className="bg-red-600 text-white text-center">450x MULTIPLIER</div>
                      <div className="py-2"></div>
                     
                     
              
                   </div>
                       <div className="flex justify-center text-xs" >WHEN YOU SWAP</div>
                       <div className="flex">
                       <div>
                       <img 
                            className="border-2"
                             width="30px"
                             height="30px"
                             src="/images/egg.svg"
                         />
                       </div>
                       <div className="flex">
                       <input type='text' className="border-2 border-gray-400-500"
                       onChange={handleEggSwap}
                       value={swapEggInput}></input>
                       </div>
                       <div className="flex">
                       <button className="bg-gray-400 rounded px-4 py-0.5 text-xs"
                       onClick={putSwapEggMax}>Max</button>
                       </div>
                       </div>
                      
                       <div className="flex justify-center">
                   <img 
                            className="align-bottom"
                             width="8px"
                             height="10px"
                             src="/images/downarrow.svg"
                         />
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="text-xs">YOU WILL RECEIVE</div>
                      <div className="flex">
                   <div>
                       <img 
                            className="border-2"
                             width="30px"
                             height="30px"
                             src="/images/feed.svg"
                         />
                       </div>
                       <div className="flex">
                       <input type='number' className="border-2 border-gray-400-500" 
                  
                       value={  (Number(swapEggInput)*Number(450)) }
                         ></input>
                       </div>

                    
                   </div>
                   <div className="py-2"></div>
                   <div> 
                       <button 
                       onClick={async() => {await swapFishForFeed(swapEggInput); }}
                       className="bg-red-600 px-20 rounded-full text-white text-xs  py-3">Swap Egg</button>
                   </div>

                   </div>
                   <div className="py-3"></div>
                

                 
                      
               
                   </div>
              </div>

          </div>
      </div>

     
    </div>
        ):(<div className='flex flex-col items-center justify-center min-h-screen py-2'>
        <Head>
         <title>Create Next App</title>
         <link rel='icon' href='/favicon.ico' />
        </Head>
        <main className='flex flex-col items-center justify-center w-full  px-20 text-center'>
        <p className='mb-4 text-xs text-gray-700'> {loginState}</p>
          
        </main>
       <button className='px-6 py-4 rounded-md text-sm font-medium border-0 focus:outline-none focus: ring-transparent' onClick={login}>Sign in with Metamask</button>
       <br />
       <button className='px-6 py-4 rounded-md text-sm font-medium border-0 focus:outline-none focus: ring-transparent' onClick={checkUser}>Check User</button>
 
     </div>)}
      </div>
       
        

    );

}

export default Home;