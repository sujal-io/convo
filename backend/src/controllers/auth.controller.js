import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
export const signup = async (req, res) => {
    const {fullname, email, password} = req.body;

    try{
         if(!fullname || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
         }

         if(password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
         }

         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if(!emailRegex.test(email)){
            return res.status(400).json({message: 'Invalid email format'});
         }

         const user = await User.findOne({email});
         if(user){
            return res.status(400).json({message: 'Email is already registered'});
         }

         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);

         const newUser = new User({
            fullname,
            email,
            password: hashedPassword
         });

         if(newUser){
             // persist user first and then issue auth cookie
               const savedUser = await newUser.save();
               generateToken(newUser._id, res);

                res.status(201).json({
                    _id: newUser._id,
                    fullname: newUser.fullname,
                    email: newUser.email,
                    profilePic: newUser.profilePic,
                });

             // todo: send welcome email

         } else {
            return res.status(400).json({message: 'Failed to create user'});
         }
    }
    catch(error){
        console.log("Signup error:", error);
        return res.status(500).json({message: 'Internal server error'});
    }
}