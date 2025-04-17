import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertContactSchema, STAGES } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API routes
  const apiRouter = express.Router();

  // Get all contacts
  apiRouter.get("/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Get contacts by stage
  apiRouter.get("/contacts/stage/:stage", async (req, res) => {
    const { stage } = req.params;
    
    if (!STAGES.includes(stage as any)) {
      return res.status(400).json({ message: "Invalid stage" });
    }
    
    try {
      const contacts = await storage.getContactsByStage(stage as any);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts by stage" });
    }
  });

  // Get contact by ID
  apiRouter.get("/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const contact = await storage.getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  // Create contact
  apiRouter.post("/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const newContact = await storage.createContact(contactData);
      res.status(201).json(newContact);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  // Update contact
  apiRouter.patch("/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      // We use partial here to allow updating only some fields
      const updateData = insertContactSchema.partial().parse(req.body);
      const updatedContact = await storage.updateContact(id, updateData);
      
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(updatedContact);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Move contact to a different stage
  apiRouter.patch("/contacts/:id/move", async (req, res) => {
    const id = parseInt(req.params.id);
    const { stage } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    if (!stage || !STAGES.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage" });
    }
    
    try {
      const updatedContact = await storage.moveContact(id, stage);
      
      if (!updatedContact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.json(updatedContact);
    } catch (error) {
      res.status(500).json({ message: "Failed to move contact" });
    }
  });

  // Delete contact
  apiRouter.delete("/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const success = await storage.deleteContact(id);
      
      if (!success) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Rota para atualização do tema
  apiRouter.post("/theme", async (req, res) => {
    try {
      const { variant, primary, appearance, radius } = req.body;
      
      // Validar os dados do tema
      if (!variant || !primary || !appearance || radius === undefined) {
        return res.status(400).json({ message: "Dados de tema inválidos" });
      }
      
      // Escrever no arquivo theme.json
      const fs = require('fs');
      const path = require('path');
      
      // Criar objeto do tema
      const themeData = {
        variant,
        primary,
        appearance,
        radius
      };
      
      // Escrever no arquivo
      fs.writeFileSync(
        path.join(process.cwd(), 'theme.json'), 
        JSON.stringify(themeData, null, 2)
      );
      
      res.json({ message: "Tema atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar tema:", error);
      res.status(500).json({ message: "Erro ao atualizar tema" });
    }
  });

  // Mount API routes
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
