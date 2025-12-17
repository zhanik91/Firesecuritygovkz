import type { Express } from "express";
import multer from "multer";
import { storage } from "../storage";
import { fireSafetyAI } from "../openai";
import { isAuthenticated } from "../replitAuth";
import { insertChatSessionSchema, insertChatMessageSchema, insertChatDocumentSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла. Разрешены: PDF, DOC, DOCX, TXT, JSON'));
    }
  }
});

export async function registerChatRoutes(app: Express) {
  
  // Get chat sessions
  app.get('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      res.status(500).json({ message: 'Ошибка получения сессий чата' });
    }
  });

  // Create chat session
  app.post('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const data = insertChatSessionSchema.parse({
        ...req.body,
        userId
      });
      
      const session = await storage.createChatSession(data);
      res.json(session);
    } catch (error) {
      console.error('Error creating chat session:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Неверные данные', errors: error.errors });
      }
      res.status(500).json({ message: 'Ошибка создания сессии чата' });
    }
  });

  // Delete chat session
  app.delete('/api/chat/sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Verify ownership
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: 'Сессия не найдена' });
      }
      
      await storage.deleteChatSession(sessionId);
      res.json({ message: 'Сессия удалена' });
    } catch (error) {
      console.error('Error deleting chat session:', error);
      res.status(500).json({ message: 'Ошибка удаления сессии' });
    }
  });

  // Get messages for session
  app.get('/api/chat/messages/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Verify ownership
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: 'Сессия не найдена' });
      }
      
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Ошибка получения сообщений' });
    }
  });

  // Send message
  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const data = insertChatMessageSchema.parse(req.body);
      
      // Verify session ownership
      const session = await storage.getChatSession(data.sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: 'Сессия не найдена' });
      }
      
      // Save user message
      const userMessage = await storage.createChatMessage(data);
      
      // Get session context (recent messages and documents)
      const recentMessages = await storage.getChatMessages(data.sessionId);
      const documents = await storage.getChatDocuments(data.sessionId);
      
      // Prepare context for AI
      const context = documents.map(doc => 
        `Документ: ${doc.fileName}\n${doc.summary || doc.extractedText?.slice(0, 1000) || ''}`
      ).join('\n\n');
      
      const messagesToSend = recentMessages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Generate AI response
      try {
        const aiResponse = await fireSafetyAI.generateChatResponse(
          messagesToSend,
          context
        );
        
        // Save AI response
        await storage.createChatMessage({
          sessionId: data.sessionId,
          role: 'assistant',
          content: aiResponse,
        });
      } catch (aiError) {
        console.error('AI Error:', aiError);
        // Save error message
        await storage.createChatMessage({
          sessionId: data.sessionId,
          role: 'assistant',
          content: 'Извините, произошла ошибка при генерации ответа. Проверьте настройки API.',
        });
      }
      
      res.json(userMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Неверные данные', errors: error.errors });
      }
      res.status(500).json({ message: 'Ошибка отправки сообщения' });
    }
  });

  // Upload and analyze document
  app.post('/api/chat/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { sessionId } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: 'Файл не загружен' });
      }
      
      // Verify session ownership
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: 'Сессия не найдена' });
      }
      
      try {
        // Read file content
        const filePath = file.path;
        const fileContent = await fs.readFile(filePath, 'utf8');
        
        // Extract text and create summary
        const extractedText = await fireSafetyAI.extractTextFromDocument(fileContent, file.mimetype);
        const summary = await fireSafetyAI.summarizeDocument(extractedText, file.originalname);
        
        // Save document record
        const document = await storage.createChatDocument({
          sessionId,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: filePath,
          extractedText: extractedText.slice(0, 50000), // Limit stored text
          summary
        });
        
        // Analyze document for fire safety
        try {
          const analysis = await fireSafetyAI.analyzeDocument(extractedText, file.originalname);
          
          // Save analysis as message
          await storage.createChatMessage({
            sessionId,
            role: 'assistant',
            content: JSON.stringify(analysis),
            metadata: { type: 'analysis', documentId: document.id }
          });
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          // Save simple upload confirmation
          await storage.createChatMessage({
            sessionId,
            role: 'assistant',
            content: `Документ "${file.originalname}" успешно загружен и обработан. Резюме: ${summary}`,
          });
        }
        
        // Clean up uploaded file
        await fs.unlink(filePath);
        
        res.json({ 
          message: 'Документ успешно загружен и проанализирован',
          document 
        });
      } catch (processingError) {
        console.error('File processing error:', processingError);
        // Clean up file on error
        if (file.path) {
          await fs.unlink(file.path).catch(() => {});
        }
        res.status(500).json({ message: 'Ошибка обработки файла' });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ message: 'Ошибка загрузки документа' });
    }
  });

  // Get documents for session
  app.get('/api/chat/documents/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Verify ownership
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: 'Сессия не найдена' });
      }
      
      const documents = await storage.getChatDocuments(sessionId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Ошибка получения документов' });
    }
  });
}