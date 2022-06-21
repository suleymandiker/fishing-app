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
          <div>Fishing: {myaddress}</div>
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