import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from '../config/db';
import { UserRepository } from "../repositories/userRepository";

  const userRepository = new UserRepository();

  export const login = async (req: Request, res: Response) => 
    { const { email, password } = req.body; 
  
  
  if (!email || !password) { 
    return res.status(400).json({ message: "Email e senha são obrigatórios" }); } 
    
    
    try { const usuario = await userRepository.findByEmail(email); 
      
      if (!usuario) { return res.status(401).json({ message: "Usuário não encontrado" }); } 
      
      const senhaValida = await bcrypt.compare(password, usuario.senha);
      
      if (!senhaValida) { return res.status(401).json({ message: 'Senha incorreta' }); } 
      
      
      const token = jwt.sign({ email: usuario.email }, process.env.JWT_SECRET as string, 
        { expiresIn: '1h', }); 
        
        
        console.log("Entrou no login com:", req.body); 
        
        res.json({ message: "Login bem-sucedido",
           token, usuario: 
           { id: usuario.id, 
            name: usuario.name, 
            email: usuario.email, } }
          
          ); } 
           
           catch (err) { console.error(err); 
            res.status(500).json({ message: 'Erro no servidor' });
          
          } };




