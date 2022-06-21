import supabase from './services/supabase';
import { v4 as uuidv4 } from "uuid"

// POST /api/auth/nonce 



    

const nonceApi = async (req,res) => {



    const { walletAddr } = req.body;
    console.log('walletAddress:', walletAddr)
    const nonce = uuidv4();
    const id = uuidv4();
 



     

    let { data, error } = await supabase
        .from('users')
        .select('nonce')
        .eq('walletAddr', walletAddr)


    if(data.length > 0 ){
       let { data, error } =  await supabase.from('users').update({ nonce}).match({ walletAddr })
  
    } else {
       let { data,  error } =  await supabase.from('users').insert({ id, nonce, walletAddr })
   
     
    }
   


 

    if(error) {
        res.status(400).json({ error: error.message})
    } else {
        res.status(200).json({ nonce })
    }
}

export default nonceApi;