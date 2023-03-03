import { createContext, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import api from '../api/Post'
import { useNavigate } from "react-router-dom";

const AuthContext = createContext()
export default AuthContext;

export const AuthProvider = ({children}) =>{


    let navigate = useNavigate()

    let [authTokens, setAuthTokens] = useState(localStorage.getItem('authTokens')?JSON.parse(localStorage.getItem('authTokens')):null)
    let [user,setUser] = useState(localStorage.getItem('authTokens')?jwt_decode(localStorage.getItem('authTokens')):null)
    let [loginMessage,setLoginMessage] = useState('')
    let [loading,setLoading] = useState(true)
    let [songs,setSongs] = useState([])
    let [likedSongs, setLikedSongs] = useState([])




    //==========================================================================================================================
    //User Login 
    const loginUser = async(e)=>{
        e.preventDefault();
        let response = await api.post("/token/",{
            "email":e.target.email.value,
            "password":e.target.password.value
        })
        .catch(err=>console.log(err))
        if(response && response.status === 200){
            setAuthTokens(response.data);
            setUser(jwt_decode(response.data.access));
            localStorage.setItem('authTokens',JSON.stringify(response.data));
            navigate("/")
        }
        else{
            setLoginMessage("Error credentials Not Found")
        }
    }
    //================================================================================================================================
    //Logout User
    const logoutUser = ()=>{
        navigate("/login");
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    }

    //=================================================================================================================================
    //Token Update
    const updateToken = async()=>{
        
        let response = await api.post("/token/refresh/",{
            'refresh':authTokens?.refresh
        })
        .catch((err)=>logoutUser)
        if(response && response.status===200){
            setAuthTokens(response.data)
            setUser(jwt_decode(response.data.access))
            localStorage.setItem('authTokens',JSON.stringify(response.data))
        }
        if(loading){
            setLoading(false)
        }
    }


    //=========================================================================================================================
    //UseEffect for Token Updation
    useEffect(()=>{
        if(loading){
            updateToken()
        }
        let fourminutes = 4*60*1000;
        let interval = setInterval(()=>{
            if(authTokens){
                updateToken()
            }
        },fourminutes)
        return ()=>clearInterval(interval)
    },[authTokens,loading])



    //=======================================================================================================================
    //Get songs Function
    const getSongs = async()=>{
        let response = await api.get("/songs/",{
            headers:{
                "Content-Type":"application/json",
                "Authorization":"Bearer "+String(authTokens?.access)
            }
        })
        .catch(err=>console.log(err))
        if(response && response.status === 200){
            setSongs(response.data)
        }
        
    }

    useEffect(()=>{
        getSongs()
    },[])


    //==================================================================================================================================
    //Get Liked Songs
    const getLikedSongs = async()=>{
        let response = await api.get("/likes/",{
            "headers":{
                "Content-type":"application/json",
                "Authorization":"Bearer "+String(authTokens?.access)
            }
        })
        .catch(err=>console.log(err))
        if(response && response.status===200){
            
            setLikedSongs(response.data)
        }
    }


    useEffect(()=>{
        getLikedSongs()
    },[])
    

    
    


    

    //===================================================================================================================
    //Context Api context data
    let ContextData = {
        loginUser:loginUser,
        loginMessage:loginMessage,
        user:user,
        logoutUser:logoutUser,
        songs:songs,
        setSongs:setSongs,
        getLikedSongs:getLikedSongs,
        likedSongs:likedSongs,
        setLikedSongs:setLikedSongs,
        getSongs:getSongs,
        authTokens:authTokens,
        
    }
    return (
        <AuthContext.Provider value={ContextData}>
            {children}
        </AuthContext.Provider>
    )
}
