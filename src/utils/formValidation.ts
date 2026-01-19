import { FormData, FieldDefinition, ListingFieldsConfig, CompletenessScore } from '@/types/listingFields';

/**
 * Calculate form completeness score and identify missing fields
 */
export const calculateCompleteness = (
    formData: FormData,
    config: ListingFieldsConfig
): CompletenessScore => {
    const allFields = config.groups.flatMap(g => g.fields);

    const requiredFields = allFields
        .filter(f => f.importance === 'required')
        .filter(f => shouldDisplayField(f, formData));

    const recommendedFields = allFields
        .filter(f => f.importance === 'recommended')
        .filter(f => shouldDisplayField(f, formData));

    const isFieldFilled = (field: FieldDefinition): boolean => {
        const value = formData[field.name];

        if (value === undefined || value === null || value === '') {
            return false;
        }

        if (Array.isArray(value) && value.length === 0) {
            return false;
        }

        return true;
    };

    const filledRequired = requiredFields.filter(isFieldFilled);
    const filledRecommended = recommendedFields.filter(isFieldFilled);

    const requiredScore = requiredFields.length > 0
        ? (filledRequired.length / requiredFields.length) * 60
        : 60; // If no required fields, give full required score

    const recommendedScore = recommendedFields.length > 0
        ? (filledRecommended.length / recommendedFields.length) * 40
        : 40; // If no recommended fields, give full recommended score

    const missingRequired = requiredFields
        .filter(f => !isFieldFilled(f))
        .map(f => f.label);

    const missingRecommended = recommendedFields
        .filter(f => !isFieldFilled(f))
        .map(f => f.label);

    return {
        score: Math.round(requiredScore + recommendedScore),
        requiredFilled: filledRequired.length,
        requiredTotal: requiredFields.length,
        recommendedFilled: filledRecommended.length,
        recommendedTotal: recommendedFields.length,
        missingRequired,
        missingRecommended,
    };
};

/**
 * Validate a single field
 */
export const validateField = (
    field: FieldDefinition,
    value: any
): string | null => {
    // Required validation
    if (field.importance === 'required') {
        if (value === undefined || value === null || value === '') {
            return `${field.label}为必填项`;
        }
        if (Array.isArray(value) && value.length === 0) {
            return `${field.label}为必填项`;
        }
    }

    // Type-specific validation
    if (value && field.validation) {
        const { min, max, pattern, custom } = field.validation;

        // Min/Max for numbers
        if (field.type === 'number' && typeof value === 'number') {
            if (min !== undefined && value < min) {
                return `${field.label}不能小于${min}`;
            }
            if (max !== undefined && value > max) {
                return `${field.label}不能大于${max}`;
            }
        }

        // Min/Max for text length
        if ((field.type === 'text' || field.type === 'textarea') && typeof value === 'string') {
            if (min !== undefined && value.length < min) {
                return `${field.label}至少需要${min}个字符`;
            }
            if (max !== undefined && value.length > max) {
                return `${field.label}不能超过${max}个字符`;
            }
        }

        // Min/Max for arrays
        if (Array.isArray(value)) {
            if (min !== undefined && value.length < min) {
                return `${field.label}至少需要${min}项`;
            }
            if (max !== undefined && value.length > max) {
                return `${field.label}不能超过${max}项`;
            }
        }

        // Pattern validation
        if (pattern && typeof value === 'string') {
            if (!pattern.test(value)) {
                return `${field.label}格式不正确`;
            }
        }

        // Custom validation
        if (custom) {
            const result = custom(value);
            if (result !== true) {
                return typeof result === 'string' ? result : `${field.label}验证失败`;
            }
        }
    }

    return null;
};

/**
 * Validate all fields in the form
 */
export const validateAll = (
    formData: FormData,
    config: ListingFieldsConfig
): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    const allFields = config.groups.flatMap(g => g.fields);

    for (const field of allFields) {
        // Check conditional display
        if (field.conditional) {
            const { dependsOn, value: condValue, operator = 'equals' } = field.conditional;
            const dependValue = formData[dependsOn];

            let shouldDisplay = false;
            switch (operator) {
                case 'equals':
                    shouldDisplay = dependValue === condValue;
                    break;
                case 'notEquals':
                    shouldDisplay = dependValue !== condValue;
                    break;
                case 'includes':
                    shouldDisplay = Array.isArray(dependValue) && dependValue.includes(condValue);
                    break;
                case 'greaterThan':
                    shouldDisplay = dependValue > condValue;
                    break;
                case 'lessThan':
                    shouldDisplay = dependValue < condValue;
                    break;
            }

            if (!shouldDisplay) {
                // Skip validation for hidden fields
                continue;
            }
        }

        const error = validateField(field, formData[field.name]);
        if (error) {
            errors[field.name] = error;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Check if a field should be displayed based on conditional logic
 */
export const shouldDisplayField = (
    field: FieldDefinition,
    formData: FormData
): boolean => {
    if (!field.conditional) {
        return true;
    }

    const { dependsOn, value: condValue, operator = 'equals' } = field.conditional;
    const dependValue = formData[dependsOn];

    switch (operator) {
        case 'equals':
            return dependValue === condValue;
        case 'notEquals':
            return dependValue !== condValue;
        case 'includes':
            return Array.isArray(dependValue) && dependValue.includes(condValue);
        case 'greaterThan':
            return dependValue > condValue;
        case 'lessThan':
            return dependValue < condValue;
        default:
            return true;
    }
};
