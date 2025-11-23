/**
 * Service for handling Llama Chat operations using Groq API.
 * 
 * This service provides chat functionality using the Llama 3.3 70B Versatile model
 * through Groq's API. It's a separate service from the Langchain chat service.
 * 
 * @class LlamaChatService
 */

import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ChatMessageDto } from './dtos/chat-message.dto';
import customMessage from 'src/utils/responses/customMessage.response';
import { MESSAGES } from 'src/utils/constants/messages.constants';
import Groq from 'groq-sdk';
import { Pool } from 'pg';

@Injectable()
export class LlamaChatService implements OnModuleInit {
  private readonly logger = new Logger(LlamaChatService.name);
  private groq: Groq | null = null;
  private readonly model = 'llama-3.3-70b-versatile';
  private pool: Pool | null = null;

  constructor() {
    // Initialize Groq client if API key is available
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({
        apiKey: apiKey,
      });
      this.logger.log('✅ Groq client initialized with Llama 3.3 70B model');
    } else {
      this.logger.warn('⚠️  GROQ_API_KEY not found. Llama chat service will not be available.');
    }
  }

  async onModuleInit() {
    // Initialize database connection pool
    try {
      this.pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'skillpilot',
        password: process.env.DB_PASSWORD || 'skillpilot123',
        database: process.env.DB_NAME || 'skillpilot_db',
      });
      this.logger.log('✅ Database pool initialized for Llama Chat Service');
    } catch (error) {
      this.logger.error('❌ Failed to initialize database pool:', error);
    }
  }

  /**
   * Get learner ID by email
   */
  async getLearnerIdByEmail(email: string): Promise<number | null> {
    if (!this.pool) {
      return null;
    }

    try {
      const result = await this.pool.query(
        'SELECT id FROM learners WHERE email = $1',
        [email],
      );
      return result.rows.length > 0 ? result.rows[0].id : null;
    } catch (error) {
      this.logger.error('Error getting learner ID by email:', error);
      return null;
    }
  }

  /**
   * Get comprehensive learner context for personalized responses
   */
  private async getLearnerContext(learnerId: number): Promise<any> {
    if (!this.pool) {
      return {};
    }

    try {
      const context: any = {
        learnerId,
        skillProfile: null,
        learningPath: null,
        completedContent: [],
        strengths: [],
        growthAreas: [],
        skills: [],
      };

      // Get skill profile
      const profileResult = await this.pool.query(
        'SELECT * FROM "skillProfiles" WHERE "learnerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [learnerId],
      );

      if (profileResult.rows.length > 0) {
        const profile = profileResult.rows[0];
        context.skillProfile = profile;
        
        // Get strengths and growth areas
        const strengths = await this.pool.query(
          'SELECT * FROM "skillStrengths" WHERE "skillProfileId" = $1',
          [profile.id],
        );
        const growthAreas = await this.pool.query(
          'SELECT * FROM "skillGrowthAreas" WHERE "skillProfileId" = $1',
          [profile.id],
        );
        const skillMap = await this.pool.query(
          'SELECT * FROM "skillMaps" WHERE "skillProfileId" = $1',
          [profile.id],
        );

        context.strengths = strengths.rows.map((s) => s.strength);
        context.growthAreas = growthAreas.rows.map((g) => g.area);
        context.skills = skillMap.rows.map((s) => ({
          skill: s.skill,
          level: s.level,
          category: s.category,
        }));
      }

      // Get learning path
      const learningPathResult = await this.pool.query(
        'SELECT * FROM "learningPaths" WHERE "learnerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [learnerId],
      );

      if (learningPathResult.rows.length > 0) {
        const learningPath = learningPathResult.rows[0];
        context.learningPath = learningPath;
        
        // Parse weeks from description if stored as JSON
        try {
          const weeksData = JSON.parse(learningPath.description || '{}');
          if (weeksData.weeks) {
            context.learningPath.weeks = weeksData.weeks;
          }
        } catch (e) {
          // Description is not JSON, use as is
        }
      }

      // Get completed content (quizzes and challenges)
      const contentResult = await this.pool.query(
        `SELECT "contentType", topic, score, percentage, "completedAt"
         FROM "contentResults" 
         WHERE "learnerId" = $1 
         ORDER BY "completedAt" DESC 
         LIMIT 10`,
        [learnerId],
      );

      context.completedContent = contentResult.rows;

      return context;
    } catch (error) {
      this.logger.error('Error getting learner context:', error);
      return {};
    }
  }

  /**
   * Build rule engine system prompt that restricts answers to learner's context
   */
  private buildRuleEnginePrompt(context: any): string {
    // Extract all topics from learning path for validation
    const allTopics: string[] = [];
    if (context.learningPath?.weeks) {
      context.learningPath.weeks.forEach((week: any) => {
        if (week.title) allTopics.push(week.title.toLowerCase());
        if (week.subtitle) allTopics.push(week.subtitle.toLowerCase());
      });
    }
    if (context.completedContent) {
      context.completedContent.forEach((content: any) => {
        if (content.topic) allTopics.push(content.topic.toLowerCase());
      });
    }
    if (context.skills) {
      context.skills.forEach((skill: any) => {
        if (skill.skill) allTopics.push(skill.skill.toLowerCase());
      });
    }

    let prompt = `You are an AI Career Coach for SkillPilot AI, an intelligent learning platform.

⚠️⚠️⚠️ CRITICAL RULES - YOU MUST FOLLOW THESE STRICTLY - NO EXCEPTIONS - VIOLATION WILL CAUSE REJECTION ⚠️⚠️⚠️

1. **STRICT CONTEXT BOUNDARY**: You MUST ONLY answer questions that are DIRECTLY related to:
   - The learner's current learning path modules and topics (listed below)
   - Their skill profile (strengths, growth areas, skills listed below)
   - Their completed quizzes and coding challenges (listed below)
   - Technical concepts EXPLICITLY mentioned in their learning journey

2. **ABSOLUTE PROHIBITION - DO NOT ANSWER**: You MUST NOT answer questions about:
   - Food, restaurants, recipes, cooking, cuisine, biryani, dishes, meals
   - Travel, hotels, vacations, destinations, places, locations, spots
   - Movies, films, entertainment, music, songs, artists
   - Sports, games, football, cricket, basketball
   - Weather, news, politics, celebrities, gossip
   - Shopping, fashion, clothing, stores
   - ANY general knowledge not in the learner's context below
   - ANY topic not explicitly listed in the learner's learning path

3. **MANDATORY REJECTION FORMAT**: If asked about ANYTHING outside the learner's context, you MUST respond EXACTLY with this message (do not provide any other information, do not list places, do not give recommendations):
   "I'm your AI Career Coach focused on your personalized learning journey. I can only help you with topics from your learning path, skill profile, and completed content. The question you asked isn't related to your current learning journey. Would you like help with something from your learning path instead?"

4. **VALIDATION CHECK - BEFORE EVERY RESPONSE**: 
   - Step 1: Check if the question is about a topic in the learner's learning path (weeks/modules below)
   - Step 2: Check if it's about their skill profile or completed content
   - Step 3: If NO to both, you MUST use the rejection message from Rule #3
   - Step 4: If YES, only use information from the context provided below

5. **ONLY USE PROVIDED CONTEXT**: Base ALL answers ONLY on the information provided below. Do not use general knowledge. Do not make up information. Do not provide examples from outside the learner's context.

6. **EXAMPLES OF FORBIDDEN RESPONSES**:
   - ❌ "Here are some popular biryani spots: Hyderabad, Lahore..."
   - ❌ "I recommend visiting these restaurants..."
   - ❌ "Here are the best places for..."
   - ✅ "I can only help with topics from your learning path. Would you like help with [specific module from their path]?"

LEARNER CONTEXT (ONLY USE THIS INFORMATION - IGNORE EVERYTHING ELSE):`;

    if (context.skillProfile) {
      prompt += `\n\nSKILL PROFILE:`;
      if (context.strengths && context.strengths.length > 0) {
        prompt += `\n- Strengths: ${context.strengths.join(', ')}`;
      }
      if (context.growthAreas && context.growthAreas.length > 0) {
        prompt += `\n- Growth Areas: ${context.growthAreas.join(', ')}`;
      }
      if (context.skills && context.skills.length > 0) {
        const skillsList = context.skills.map((s: any) => `${s.skill} (${s.level})`).join(', ');
        prompt += `\n- Skills: ${skillsList}`;
      }
    }

    if (context.learningPath) {
      prompt += `\n\nLEARNING PATH:`;
      prompt += `\n- Title: ${context.learningPath.title || 'N/A'}`;
      prompt += `\n- Progress: ${context.learningPath.progress || 0}%`;
      prompt += `\n- Status: ${context.learningPath.status || 'N/A'}`;
      
      if (context.learningPath.weeks && Array.isArray(context.learningPath.weeks)) {
        prompt += `\n- Weekly Modules:`;
        context.learningPath.weeks.forEach((week: any, index: number) => {
          prompt += `\n  Week ${week.week || index + 1}: ${week.title || 'N/A'} (${week.modules || 0} modules, ${week.progress || 0}% complete)`;
          if (week.subtitle) {
            prompt += ` - ${week.subtitle}`;
          }
        });
      }
    }

    if (context.completedContent && context.completedContent.length > 0) {
      prompt += `\n\nRECENTLY COMPLETED CONTENT:`;
      context.completedContent.forEach((content: any, index: number) => {
        prompt += `\n- ${content.contentType}: ${content.topic} (Score: ${content.percentage || 0}%)`;
      });
    }

    prompt += `\n\nVALIDATION REMINDER:
Before answering, verify the question relates to one of these topics: ${allTopics.length > 0 ? allTopics.slice(0, 10).join(', ') : 'No topics available'}...

If the question is NOT about these topics, you MUST respond with the rejection message from Rule #3.

RESPONSE GUIDELINES (ONLY FOR CONTEXT-RELATED QUESTIONS):
- Focus on helping the learner with their current learning journey
- Provide encouragement based on their progress
- Suggest next steps from their learning path
- Explain concepts from their modules when asked
- Reference specific modules, weeks, or completed content
- Always be supportive, clear, and practical

REMEMBER: If the question is about ANYTHING not listed above (food, restaurants, general knowledge, unrelated topics), you MUST use the rejection message. Do not provide any information outside the learner's context.`;

    return prompt;
  }

  /**
   * Process a chat message using Llama 3.3 70B Versatile model
   * @param chatMessageDto - DTO containing the user's message and optional chat history
   * @returns Response from the Llama model
   */
  async chat(chatMessageDto: ChatMessageDto) {
    try {
      if (!this.groq) {
        throw new HttpException(
          'AI service not configured. Please set GROQ_API_KEY environment variable.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const { message, history = [] } = chatMessageDto;

      // Format messages for Groq API
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.',
        },
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ];

      const completion = await this.groq.chat.completions.create({
        messages: messages as any,
        model: this.model,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const response = completion.choices[0]?.message?.content || 'No response generated';

      this.logger.log(`✅ Chat response generated for message: ${message.substring(0, 50)}...`);

      return customMessage(HttpStatus.OK, MESSAGES.SUCCESS, {
        response,
        model: this.model,
      });
    } catch (error: any) {
      this.logger.error('Error in Llama chat:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to process chat message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Validate if a question is related to learner's context
   * STRICT MODE: Only allows questions that match actual learner topics
   */
  private isQuestionRelatedToContext(message: string, context: any): boolean {
    const messageLower = message.toLowerCase();
    
    // Common off-topic keywords that should be rejected
    const offTopicKeywords = [
      'biryani', 'restaurant', 'food', 'recipe', 'cooking', 'cuisine', 'dish', 'meal', 'eat', 'dining',
      'travel', 'hotel', 'vacation', 'tourism', 'destination', 'trip', 'visit', 'place', 'spot', 'location',
      'movie', 'film', 'entertainment', 'music', 'song', 'artist', 'album',
      'sports', 'game', 'football', 'cricket', 'basketball', 'soccer', 'tennis',
      'weather', 'news', 'politics', 'celebrity', 'gossip',
      'shopping', 'fashion', 'clothing', 'buy', 'purchase', 'store',
      'best', 'recommend', 'suggest', 'where to', 'where can', 'which is the best',
    ];

    // STRICT: Check for off-topic keywords first - reject immediately
    if (offTopicKeywords.some(keyword => messageLower.includes(keyword))) {
      this.logger.warn(`🚫 Off-topic keyword detected: "${message.substring(0, 50)}..."`);
      return false;
    }

    // Extract all valid topics from context
    const validTopics: string[] = [];
    
    if (context.learningPath?.weeks) {
      context.learningPath.weeks.forEach((week: any) => {
        if (week.title) {
          const words = week.title.toLowerCase().split(/\s+/);
          validTopics.push(...words);
          validTopics.push(week.title.toLowerCase());
        }
        if (week.subtitle) {
          const words = week.subtitle.toLowerCase().split(/\s+/);
          validTopics.push(...words);
          validTopics.push(week.subtitle.toLowerCase());
        }
      });
    }
    
    if (context.completedContent) {
      context.completedContent.forEach((content: any) => {
        if (content.topic) {
          const words = content.topic.toLowerCase().split(/\s+/);
          validTopics.push(...words);
          validTopics.push(content.topic.toLowerCase());
        }
      });
    }
    
    if (context.skills) {
      context.skills.forEach((skill: any) => {
        if (skill.skill) {
          const words = skill.skill.toLowerCase().split(/\s+/);
          validTopics.push(...words);
          validTopics.push(skill.skill.toLowerCase());
        }
      });
    }
    
    if (context.strengths) {
      context.strengths.forEach((strength: string) => {
        const words = strength.toLowerCase().split(/\s+/);
        validTopics.push(...words);
        validTopics.push(strength.toLowerCase());
      });
    }
    
    if (context.growthAreas) {
      context.growthAreas.forEach((area: string) => {
        const words = area.toLowerCase().split(/\s+/);
        validTopics.push(...words);
        validTopics.push(area.toLowerCase());
      });
    }

    // Remove duplicates
    const uniqueTopics = [...new Set(validTopics)];

    // STRICT: Check if message contains ANY valid topic word
    const containsValidTopic = uniqueTopics.some(topic => {
      // Check if topic word appears in message (minimum 3 chars to avoid false matches)
      if (topic.length >= 3) {
        return messageLower.includes(topic);
      }
      return false;
    });

    // STRICT: Only allow if it contains a valid topic from learner's context
    // Remove the learning keywords fallback - too permissive
    return containsValidTopic;
  }

  /**
   * Validate if AI response is related to learner's context
   * Post-validation to catch AI responses that go off-topic
   */
  private isResponseRelatedToContext(response: string, context: any): boolean {
    const responseLower = response.toLowerCase();
    
    // Check for off-topic indicators in response
    const offTopicIndicators = [
      'biryani', 'restaurant', 'food', 'recipe', 'cooking', 'cuisine',
      'hyderabad', 'lahore', 'bangalore', 'chennai', 'mumbai', 'delhi',
      'travel', 'hotel', 'vacation', 'tourism', 'destination',
      'movie', 'film', 'entertainment', 'music', 'song',
      'sports', 'game', 'football', 'cricket', 'basketball',
    ];

    // If response contains off-topic indicators, reject it
    if (offTopicIndicators.some(indicator => responseLower.includes(indicator))) {
      this.logger.warn(`🚫 Off-topic response detected: "${response.substring(0, 100)}..."`);
      return false;
    }

    // Extract valid topics from context
    const validTopics: string[] = [];
    
    if (context.learningPath?.weeks) {
      context.learningPath.weeks.forEach((week: any) => {
        if (week.title) validTopics.push(week.title.toLowerCase());
        if (week.subtitle) validTopics.push(week.subtitle.toLowerCase());
      });
    }
    
    if (context.completedContent) {
      context.completedContent.forEach((content: any) => {
        if (content.topic) validTopics.push(content.topic.toLowerCase());
      });
    }
    
    if (context.skills) {
      context.skills.forEach((skill: any) => {
        if (skill.skill) validTopics.push(skill.skill.toLowerCase());
      });
    }

    // Check if response references learner's topics
    const referencesLearnerContext = validTopics.some(topic => {
      if (topic.length >= 3) {
        return responseLower.includes(topic);
      }
      return false;
    });

    // Also check for learning-related context words
    const learningContextWords = [
      'learning path', 'module', 'week', 'progress', 'skill', 'journey',
      'quiz', 'challenge', 'completed', 'profile', 'strength', 'growth',
    ];

    const hasLearningContext = learningContextWords.some(word => 
      responseLower.includes(word)
    );

    // Response is valid if it references learner context OR has learning context
    return referencesLearnerContext || hasLearningContext;
  }

  /**
   * Process a career coach chat message using Llama 3.3 70B Versatile model
   * Uses rule engine to restrict answers to learner's context only
   * @param learnerId - The ID of the learner
   * @param chatMessageDto - DTO containing the user's message and optional chat history
   * @returns Response from the Llama model with career coaching focus, bound to learner context
   */
  async careerCoach(learnerId: number, chatMessageDto: ChatMessageDto) {
    try {
      if (!this.groq) {
        throw new HttpException(
          'AI service not configured. Please set GROQ_API_KEY environment variable.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const { message, history = [] } = chatMessageDto;

      // Get learner context for personalized, context-bound responses
      this.logger.log(`📊 Fetching learner context for learner ${learnerId}...`);
      const learnerContext = await this.getLearnerContext(learnerId);
      
      // Check if learner has any context at all
      const hasContext = learnerContext.learningPath || learnerContext.skillProfile || (learnerContext.completedContent && learnerContext.completedContent.length > 0);
      
      if (!hasContext) {
        this.logger.warn(`⚠️ No learning context found for learner ${learnerId}`);
        return customMessage(HttpStatus.OK, MESSAGES.SUCCESS, {
          response: "I'm your AI Career Coach. It looks like you haven't set up your learning path or skill profile yet. Please generate your skill profile and learning path first, then I can help you with questions about your personalized learning journey.",
          model: this.model,
          rejected: true,
        });
      }
      
      // Pre-validate question before sending to AI
      const isRelated = this.isQuestionRelatedToContext(message, learnerContext);
      
      if (!isRelated) {
        this.logger.warn(`🚫 Rejecting off-topic question for learner ${learnerId}: "${message.substring(0, 50)}..."`);
        return customMessage(HttpStatus.OK, MESSAGES.SUCCESS, {
          response: "I'm your AI Career Coach focused on your personalized learning journey. I can only help you with topics from your learning path, skill profile, and completed content. The question you asked isn't related to your current learning journey. Would you like help with something from your learning path instead?",
          model: this.model,
          rejected: true,
        });
      }
      
      // Build rule engine system prompt that restricts answers to learner's context
      const systemPrompt = this.buildRuleEnginePrompt(learnerContext);

      this.logger.log(`✅ Learner context loaded: ${learnerContext.skillProfile ? 'Has profile' : 'No profile'}, ${learnerContext.learningPath ? 'Has learning path' : 'No learning path'}, ${learnerContext.completedContent?.length || 0} completed items`);

      // Format messages for Groq API with rule engine system prompt
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ];

      const completion = await this.groq.chat.completions.create({
        messages: messages as any,
        model: this.model,
        temperature: 0.3, // Lower temperature for more focused, deterministic responses
        max_tokens: 1024,
      });

      let response = completion.choices[0]?.message?.content || 'No response generated';

      // Post-validation: Check if AI response is related to learner context
      const isResponseValid = this.isResponseRelatedToContext(response, learnerContext);
      
      if (!isResponseValid) {
        this.logger.warn(`🚫 AI generated off-topic response for learner ${learnerId}, rejecting and replacing...`);
        response = "I'm your AI Career Coach focused on your personalized learning journey. I can only help you with topics from your learning path, skill profile, and completed content. The question you asked isn't related to your current learning journey. Would you like help with something from your learning path instead?";
      }

      this.logger.log(`✅ Career coach response generated for learner ${learnerId}: ${message.substring(0, 50)}...`);

      return customMessage(HttpStatus.OK, MESSAGES.SUCCESS, {
        response,
        model: this.model,
      });
    } catch (error: any) {
      this.logger.error(`Error in Career Coach chat for learner ${learnerId}:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to process career coach message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check if the Llama chat service is configured and available
   * @returns Service health status
   */
  async healthCheck() {
    const isConfigured = !!this.groq;
    
    return {
      status: isConfigured ? 'OK' : 'NOT_CONFIGURED',
      service: 'Llama Chat Service',
      model: this.model,
      configured: isConfigured,
      message: isConfigured 
        ? 'Llama chat service is ready' 
        : 'GROQ_API_KEY environment variable is not set',
    };
  }
}

