import { contacts, users, type Contact, type InsertContact, type Stage, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contact operations
  getContacts(): Promise<Contact[]>;
  getContactsByStage(stage: Stage): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  moveContact(id: number, toStage: Stage): Promise<Contact | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  // Contact methods
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts);
  }

  async getContactsByStage(stage: Stage): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.stage, stage));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values({
        ...contact,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    return newContact;
  }

  async updateContact(id: number, update: Partial<InsertContact>): Promise<Contact | undefined> {
    const [updatedContact] = await db
      .update(contacts)
      .set({
        ...update,
        updated_at: new Date()
      })
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact || undefined;
  }

  async deleteContact(id: number): Promise<boolean> {
    const [deletedContact] = await db
      .delete(contacts)
      .where(eq(contacts.id, id))
      .returning();
    return !!deletedContact;
  }

  async moveContact(id: number, toStage: Stage): Promise<Contact | undefined> {
    const [updatedContact] = await db
      .update(contacts)
      .set({
        stage: toStage,
        updated_at: new Date()
      })
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact || undefined;
  }
}

// Inicializar dados de exemplo no banco
async function seedInitialData() {
  // Verificar se já existem contatos no banco
  const existingContacts = await db.select().from(contacts);
  
  if (existingContacts.length === 0) {
    console.log("Inicializando banco de dados com contatos de exemplo...");
    
    const sampleContacts: Omit<InsertContact, "id">[] = [
      {
        name: "Ana Ferreira",
        company: "Empresa Tech S.A.",
        phone: "(11) 98765-4321",
        email: "ana@empresatech.com.br",
        position: "CEO",
        stage: "lead",
        value: 6500,
        notes: "Interessada em nossa solução completa"
      },
      {
        name: "Carlos Santos",
        company: "Inovação Digital Ltda.",
        phone: "(21) 99887-6655",
        email: "carlos@inovacao.com.br",
        position: "CTO",
        stage: "lead",
        value: 12000,
        notes: "Procurando uma solução para gerenciar equipe de vendas"
      },
      {
        name: "Mariana Costa",
        company: "Nova Soluções ME",
        phone: "(31) 3555-7788",
        email: "mariana@novasolucoes.com",
        position: "Gerente Comercial",
        stage: "contatado",
        value: 8750,
        notes: "Primeiro contato realizado, demonstrou interesse"
      },
      {
        name: "Ricardo Almeida",
        company: "Construtora Horizonte",
        phone: "(47) 99112-3344",
        email: "ricardo@horizonteconst.com.br",
        position: "Diretor de Vendas",
        stage: "apresentacao",
        value: 35000,
        notes: "Apresentação agendada para próxima semana"
      },
      {
        name: "Patricia Mendes",
        company: "Global Comércio Ltda.",
        phone: "(11) 3399-5566",
        email: "patricia@globalcomercio.com",
        position: "COO",
        stage: "proposta",
        value: 15800,
        notes: "Proposta enviada, aguardando retorno"
      },
      {
        name: "Fernando Lima",
        company: "Estrela Logística S.A.",
        phone: "(19) 98877-6655",
        email: "fernando@estrelalogistica.com.br",
        position: "Diretor",
        stage: "fechado",
        value: 28500,
        notes: "Contrato assinado, implementação em andamento"
      }
    ];
    
    // Inserir contatos de exemplo
    try {
      await db.insert(contacts).values(sampleContacts);
      console.log("Dados de exemplo inseridos com sucesso!");
    } catch (error) {
      console.error("Erro ao inserir dados de exemplo:", error);
    }
  }
}

// Exportar a instância do armazenamento
export const storage = new DatabaseStorage();

// Inicializar o banco de dados
seedInitialData().catch(console.error);
