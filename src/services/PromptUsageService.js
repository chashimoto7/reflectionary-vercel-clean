// This service manages prompt usage tracking and eligibility checking
// Think of it as the "accounting department" for your app's prompt economy

class PromptUsageService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  // Calculate the Monday of any given week - this ensures consistency
  // across different timezones and user activity patterns
  getWeekStartDate(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));

    // Reset to start of day to ensure consistent date comparisons
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  }

  // Get or create a usage record for the current week
  // This is like opening a user's weekly account ledger
  async getWeeklyUsageRecord(userId) {
    const weekStart = this.getWeekStartDate();

    // First, try to find an existing record for this week
    const { data: existingRecord, error: fetchError } = await this.supabase
      .from("user_prompt_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start_date", weekStart)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is expected for new weeks
      throw new Error(`Failed to fetch usage record: ${fetchError.message}`);
    }

    if (existingRecord) {
      return existingRecord;
    }

    // No record exists for this week, so create one
    // This happens automatically when a new week starts
    const { data: newRecord, error: createError } = await this.supabase
      .from("user_prompt_usage")
      .insert({
        user_id: userId,
        week_start_date: weekStart,
        journal_entries_this_week: 0,
        weekly_prompt_used: false,
        bonus_prompt_earned: false,
        bonus_prompt_used: false,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create usage record: ${createError.message}`);
    }

    return newRecord;
  }

  // Check what prompts a user is eligible for right now
  // This is the main function your UI will call to determine what options to show
  async getPromptEligibility(userId) {
    try {
      const record = await this.getWeeklyUsageRecord(userId);

      return {
        canUseWeeklyPrompt: !record.weekly_prompt_used,
        canUseBonusPrompt:
          record.bonus_prompt_earned && !record.bonus_prompt_used,
        journalEntriesThisWeek: record.journal_entries_this_week,
        bonusPromptEarned: record.bonus_prompt_earned,
        entriesNeededForBonus: Math.max(
          0,
          3 - record.journal_entries_this_week
        ),
      };
    } catch (error) {
      console.error("Error checking prompt eligibility:", error);
      // Return safe defaults if there's an error
      return {
        canUseWeeklyPrompt: false,
        canUseBonusPrompt: false,
        journalEntriesThisWeek: 0,
        bonusPromptEarned: false,
        entriesNeededForBonus: 3,
      };
    }
  }

  // Mark that a user has used their weekly prompt
  // This is called when they successfully generate a random prompt
  async useWeeklyPrompt(userId) {
    const weekStart = this.getWeekStartDate();

    const { error } = await this.supabase
      .from("user_prompt_usage")
      .update({
        weekly_prompt_used: true,
        weekly_prompt_used_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("week_start_date", weekStart);

    if (error) {
      throw new Error(`Failed to mark weekly prompt as used: ${error.message}`);
    }
  }

  // Mark that a user has used their bonus prompt
  async useBonusPrompt(userId) {
    const weekStart = this.getWeekStartDate();

    const { error } = await this.supabase
      .from("user_prompt_usage")
      .update({
        bonus_prompt_used: true,
        bonus_prompt_used_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("week_start_date", weekStart);

    if (error) {
      throw new Error(`Failed to mark bonus prompt as used: ${error.message}`);
    }
  }

  // This gets called every time a user saves a journal entry
  // It updates their weekly count and checks if they've earned the bonus
  async recordJournalEntry(userId) {
    try {
      const record = await this.getWeeklyUsageRecord(userId);
      const newEntryCount = record.journal_entries_this_week + 1;
      const shouldEarnBonus = newEntryCount >= 3 && !record.bonus_prompt_earned;

      const updateData = {
        journal_entries_this_week: newEntryCount,
      };

      // If they've reached 3 entries and haven't earned the bonus yet, grant it
      if (shouldEarnBonus) {
        updateData.bonus_prompt_earned = true;
      }

      const { error } = await this.supabase
        .from("user_prompt_usage")
        .update(updateData)
        .eq("user_id", userId)
        .eq("week_start_date", this.getWeekStartDate());

      if (error) {
        throw new Error(`Failed to record journal entry: ${error.message}`);
      }

      // Return information about what just happened
      // This allows the UI to show celebration messages when appropriate
      return {
        newEntryCount,
        bonusEarned: shouldEarnBonus,
        totalEntriesNeededForBonus: 3,
      };
    } catch (error) {
      console.error("Error recording journal entry:", error);
      throw error;
    }
  }
}

export default PromptUsageService;
