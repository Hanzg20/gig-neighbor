/**
 * Core type definitions for dynamic listing form system
 */

export type FieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'images'
    | 'location'
    | 'datetime'
    | 'schedule'
    | 'number-range'
    | 'checklist'
    | 'contact'
    | 'sku-list';

export type ImportanceLevel = 'required' | 'recommended' | 'optional';

export type ListingType =
    | 'GOODS'
    | 'RENTAL'
    | 'SERVICE'
    | 'TASK'
    | 'FREE_GIVEAWAY'
    | 'WANTED'
    | 'EVENT'
    | 'OTHER';

export type UserRole = 'buyer' | 'provider' | 'all';

export interface FieldValidation {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
}

export interface FieldOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface ConditionalDisplay {
    dependsOn: string;
    value: any;
    operator?: 'equals' | 'notEquals' | 'includes' | 'greaterThan' | 'lessThan';
}

export interface FieldDefinition {
    name: string;
    label: string;
    type: FieldType;
    importance: ImportanceLevel;
    placeholder?: string;
    helpText?: string;

    // Conditional display
    conditional?: ConditionalDisplay;

    // Validation rules
    validation?: FieldValidation;

    // Options (for select/checkbox/radio)
    options?: FieldOption[];

    // Default value
    defaultValue?: any;

    // Additional props
    rows?: number; // for textarea
    accept?: string; // for image upload
    multiple?: boolean; // for checkboxes
}

export interface FieldGroup {
    title: string;
    description?: string;
    fields: FieldDefinition[];
    collapsible?: boolean;
}

export interface ListingFieldsConfig {
    type: ListingType;
    role: UserRole;
    groups: FieldGroup[];
}

export interface FormData {
    [key: string]: any;
}

export interface FormErrors {
    [key: string]: string;
}

export interface CompletenessScore {
    score: number; // 0-100
    requiredFilled: number;
    requiredTotal: number;
    recommendedFilled: number;
    recommendedTotal: number;
    missingRequired: string[];
    missingRecommended: string[];
}
