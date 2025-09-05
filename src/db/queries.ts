import { db, users, sessions, accounts, verifications, gameSessions, gameScenes } from './index';
import { eq, and, desc, count } from 'drizzle-orm';
import type { User, NewUser, NewSession, GameSession, NewGameSession, GameScene, NewGameScene } from './schema';

// User queries
export const userQueries = {
  // Get user by ID
  async getById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  },

  // Get user by email
  async getByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  },

  // Create new user
  async create(userData: NewUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  },

  // Update user
  async update(id: string, userData: Partial<NewUser>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  },

  // Delete user
  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  },

  // Get user with sessions
  async getWithSessions(id: string) {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        sessions: {
          orderBy: desc(sessions.createdAt),
        },
      },
    });
  },

  // Get all users with pagination
  async getAll(limit: number = 10, offset: number = 0) {
    return await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
  },

  // Count total users
  async count(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count;
  },
};

// Game Session queries
export const gameSessionQueries = {
  // Create new game session
  async create(sessionData: NewGameSession): Promise<GameSession> {
    const result = await db.insert(gameSessions).values(sessionData).returning();
    return result[0];
  },

  // Get session by ID
  async getById(id: string): Promise<GameSession | undefined> {
    const result = await db.select().from(gameSessions).where(eq(gameSessions.id, id)).limit(1);
    return result[0];
  },

  // Get user's sessions
  async getUserSessions(userId: string): Promise<GameSession[]> {
    return await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId))
      .orderBy(desc(gameSessions.lastActive));
  },

  // Alias for getUserSessions
  async getByUserId(userId: string): Promise<GameSession[]> {
    return this.getUserSessions(userId);
  },

  // Get session with scenes
  async getWithScenes(id: string) {
    return await db.query.gameSessions.findFirst({
      where: eq(gameSessions.id, id),
      with: {
        scenes: {
          orderBy: desc(gameScenes.order),
        },
      },
    });
  },

  // Update session
  async update(id: string, sessionData: Partial<NewGameSession>): Promise<GameSession | undefined> {
    const result = await db
      .update(gameSessions)
      .set({ ...sessionData, lastActive: new Date().toISOString() })
      .where(eq(gameSessions.id, id))
      .returning();
    return result[0];
  },

  // Delete session
  async delete(id: string): Promise<void> {
    await db.delete(gameSessions).where(eq(gameSessions.id, id));
  },

  // Update last active timestamp
  async updateLastActive(id: string): Promise<GameSession | undefined> {
    const result = await db
      .update(gameSessions)
      .set({ lastActive: new Date().toISOString() })
      .where(eq(gameSessions.id, id))
      .returning();
    return result[0];
  },

  // Update session title
  async updateTitle(id: string, title: string): Promise<GameSession | undefined> {
    const result = await db
      .update(gameSessions)
      .set({ title, lastActive: new Date().toISOString() })
      .where(eq(gameSessions.id, id))
      .returning();
    return result[0];
  },

  // Mark session as completed
  async markCompleted(id: string): Promise<GameSession | undefined> {
    const result = await db
      .update(gameSessions)
      .set({ isCompleted: true, lastActive: new Date().toISOString() })
      .where(eq(gameSessions.id, id))
      .returning();
    return result[0];
  },
};

// Game Scene queries
export const gameSceneQueries = {
  // Create new scene
  async create(sceneData: NewGameScene): Promise<GameScene> {
    const result = await db.insert(gameScenes).values(sceneData).returning();
    return result[0];
  },

  // Get scene by ID
  async getById(id: string): Promise<GameScene | undefined> {
    const result = await db.select().from(gameScenes).where(eq(gameScenes.id, id)).limit(1);
    return result[0];
  },

  // Get scenes by session ID
  async getBySessionId(sessionId: string): Promise<GameScene[]> {
    return await db
      .select()
      .from(gameScenes)
      .where(eq(gameScenes.sessionId, sessionId))
      .orderBy(gameScenes.order);
  },

  // Get latest scene for session
  async getLatestBySessionId(sessionId: string): Promise<GameScene | undefined> {
    const result = await db
      .select()
      .from(gameScenes)
      .where(eq(gameScenes.sessionId, sessionId))
      .orderBy(desc(gameScenes.order))
      .limit(1);
    return result[0];
  },

  // Update scene
  async update(id: string, sceneData: Partial<NewGameScene>): Promise<GameScene | undefined> {
    const result = await db
      .update(gameScenes)
      .set(sceneData)
      .where(eq(gameScenes.id, id))
      .returning();
    return result[0];
  },

  // Delete scene
  async delete(id: string): Promise<void> {
    await db.delete(gameScenes).where(eq(gameScenes.id, id));
  },

  // Get scene count for session
  async getSceneCount(sessionId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(gameScenes)
      .where(eq(gameScenes.sessionId, sessionId));
    return result[0].count;
  },
};

// Combined queries for game functionality
export const gameQueries = {
  // Start new game session
  async startNewSession(userId: string, title?: string): Promise<{ session: GameSession; sceneCount: number }> {
    const sessionId = `session_${userId}_${Date.now()}`;
    const session = await gameSessionQueries.create({
      id: sessionId,
      userId,
      title: title || `Historia ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isCompleted: false,
    });

    // Update user's current session
    await userQueries.update(userId, { currentSessionId: sessionId });

    return { session, sceneCount: 0 };
  },

  // Continue existing session
  async continueSession(sessionId: string): Promise<{ session: GameSession; scenes: GameScene[] }> {
    const session = await gameSessionQueries.getById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const scenes = await gameSceneQueries.getBySessionId(sessionId);
    
    // Update last active
    await gameSessionQueries.update(sessionId, { lastActive: new Date().toISOString() });

    return { session, scenes };
  },

  // Add scene to session
  async addScene(sessionId: string, narrativeText: string, imageUrl: string, secondaryCharacterId?: string): Promise<GameScene> {
    const sceneCount = await gameSceneQueries.getSceneCount(sessionId);
    
    const scene = await gameSceneQueries.create({
      id: `scene_${sessionId}_${sceneCount + 1}`,
      sessionId,
      order: sceneCount + 1,
      narrativeText,
      imageUrl,
      secondaryCharacterId,
      createdAt: new Date().toISOString(),
    });

    // Update session last active
    await gameSessionQueries.update(sessionId, { lastActive: new Date().toISOString() });

    return scene;
  },
};

// Session queries
export const sessionQueries = {
  // Get session by token
  async getByToken(token: string) {
    return await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
      with: {
        user: true,
      },
    });
  },

  // Create new session
  async create(sessionData: NewSession) {
    const result = await db.insert(sessions).values(sessionData).returning();
    return result[0];
  },

  // Delete session
  async delete(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  },

  // Delete expired sessions
  async deleteExpired(): Promise<void> {
    const now = new Date().toISOString();
    await db.delete(sessions).where(eq(sessions.expiresAt, now));
  },

  // Get user sessions
  async getUserSessions(userId: string) {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt));
  },
};

// Account queries
export const accountQueries = {
  // Get account by provider
  async getByProvider(providerId: string, accountId: string) {
    return await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.providerId, providerId), eq(accounts.accountId, accountId)))
      .limit(1);
  },

  // Get user accounts
  async getUserAccounts(userId: string) {
    return await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
  },
};

// Verification queries
export const verificationQueries = {
  // Get verification by identifier and value
  async getByIdentifierAndValue(identifier: string, value: string) {
    return await db
      .select()
      .from(verifications)
      .where(and(eq(verifications.identifier, identifier), eq(verifications.value, value)))
      .limit(1);
  },

  // Delete expired verifications
  async deleteExpired(): Promise<void> {
    const now = new Date().toISOString();
    await db.delete(verifications).where(eq(verifications.expiresAt, now));
  },
};

// Example of a complex query with joins
export const complexQueries = {
  // Get user statistics
  async getUserStats(userId: string) {
    const userWithData = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        sessions: {
          columns: {
            id: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        accounts: {
          columns: {
            providerId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userWithData) return null;

    return {
      user: {
        id: userWithData.id,
        name: userWithData.name,
        email: userWithData.email,
        createdAt: userWithData.createdAt,
      },
      stats: {
        totalSessions: userWithData.sessions.length,
        activeSessions: userWithData.sessions.filter(
          (session) => new Date(session.expiresAt) > new Date()
        ).length,
        connectedProviders: userWithData.accounts.map((account) => account.providerId),
      },
    };
  },
};