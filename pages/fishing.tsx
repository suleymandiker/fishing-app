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








const Fishing: NextPage = () => {

    const [loginState,setLoginState] = useState();

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
    
    
    
      }
    


    
  



    return(
       
        <div className='flex flex-col items-center justify-center min-h-screen py-2'>
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
 
     </div>

    );

}

export default Fishing;