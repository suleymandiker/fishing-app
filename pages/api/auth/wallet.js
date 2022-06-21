
1


import supabase from './services/supabase';
import { ethers } from 'ethers'
import jwt from "jsonwebtoken";



const walletApi = async (req,res) => {



    try {

        const { walletAddr, signature, nonce } = req.body;
        const signerAddr = ethers.utils.verifyMessage(nonce, signature );

        if(signerAddr !== walletAddr) {
            throw new Error ("wrong_signature");
        }

        let { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq('walletAddr',walletAddr)
            .eq('nonce', nonce)
            .single()

        const token = jwt.sign({
            "aud": "authenticated",
            "exp": Math.floor((Date.now() / 1000) + (60*60)),
            "sub": user.id,
            "user_metadata": {
                id: user.id,  
            },
            "role": "authenticated"
        }, process.env.SUPABASE_JWT_SECRET)


        res.status(200).json({ user , token });
        
    } catch (err) {
        res.status(400).json({ error: err.message})
    }
}

export default walletApi;