import { ListingFieldsConfig } from '@/types/listingFields';

export const rentalFields: ListingFieldsConfig = {
    type: 'RENTAL',
    role: 'all',
    groups: [
        {
            title: '租赁基础信息',
            fields: [
                {
                    name: 'title',
                    label: '物品名称',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：DJI Mavic 3 无人机、高压清洗机',
                },
                {
                    name: 'images',
                    label: '物品实拍图',
                    type: 'images',
                    importance: 'required',
                    helpText: '展示物品当前品相和配件，最多6张',
                },
                {
                    name: 'description',
                    label: '物品及规则说明',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '请说明物品成色、功能，以及您的租用要求...',
                    rows: 6,
                },
                {
                    name: 'mediaUrl',
                    label: '视频介绍 (YouTube/B站)',
                    type: 'text',
                    importance: 'optional',
                    placeholder: '粘贴 YouTube 或 B站视频链接',
                    helpText: '展示物品细节或使用说明视频，提升信任度',
                }
            ]
        },
        {
            title: '价格与押金',
            fields: [
                {
                    name: 'price',
                    label: '租金 (CAD)',
                    type: 'number',
                    importance: 'required',
                    placeholder: '20.00',
                },
                {
                    name: 'unit',
                    label: '计费单位',
                    type: 'select',
                    importance: 'required',
                    options: [
                        { value: 'DAY', label: '每天' },
                        { value: 'HOUR', label: '每小时' },
                        { value: 'WEEK', label: '每周' },
                        { value: 'SESSION', label: '每次' },
                    ]
                },
                {
                    name: 'deposit',
                    label: '押金 (CAD)',
                    type: 'number',
                    importance: 'required',
                    placeholder: '100.00',
                    helpText: '租完归还无损后自动退还给租客'
                }
            ]
        },
        {
            title: '取还与限制',
            fields: [
                {
                    name: 'pickupLocation',
                    label: '取物地点',
                    type: 'location',
                    importance: 'required',
                    placeholder: '例如：Kanata Lakes',
                },
                {
                    name: 'accessories',
                    label: '含配件清单',
                    type: 'textarea',
                    importance: 'recommended',
                    placeholder: '例如：含2块电池、充电器、便携包',
                    rows: 2,
                },
                {
                    name: 'damagePolicy',
                    label: '损耗/赔偿说明',
                    type: 'textarea',
                    importance: 'recommended',
                    placeholder: '例如：划痕不计，严重摔伤按维修价格赔偿',
                    rows: 2,
                }
            ]
        }
    ]
};
