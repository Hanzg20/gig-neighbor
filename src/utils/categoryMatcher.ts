/**
 * Simple Auto-Categorization Utility
 * In production, this would use an LLM or a more complex keyword/embedding matcher.
 */
export const autoMatchSubcategory = (title: string, description: string, parentIndustryId: string): string => {
    const text = (title + " " + description).toLowerCase();

    // Simple Keyword Mapping (Mocking a more complex system)
    const mappings: Record<string, string[]> = {
        'HOUSE_SERVICES': ['clean', 'cleaning', 'assemble', 'ikea', 'furniture', 'repair', '保洁', '安装', '维修'],
        'FOOD_MARKET': ['food', 'eat', 'meal', 'bake', 'cake', 'groceries', '美食', '外卖', '代购'],
        'HOUSE_RENTAL': ['rent', 'room', 'sublet', 'lease', '租房', '分租'],
        'USED_GOODS': ['sell', 'unused', 'secondhand', 'old', '二手', '闲置'],
        'OUTDOOR_GEAR': ['camp', 'tent', 'hike', 'ski', 'snow', '露营', '铲雪'],
    };

    for (const [subId, keywords] of Object.entries(mappings)) {
        if (keywords.some(k => text.includes(k.toLowerCase()))) {
            return subId;
        }
    }

    // Default to a general sub-category for that industry or a fallback
    return `${parentIndustryId}_GENERAL`;
};
