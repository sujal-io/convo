import {create} from "zustand";

export const useAuthStore = create((set) => ({
    authUser:{name:"john doe",_id:"12345",age:30},
    isLoggedIn: false,
    isLoading: false,

    login: () =>{
        console.log("just logged in");
        set({isLoggedIn:true, isLoading:true});
    }
}));