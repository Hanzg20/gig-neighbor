import { ListingFieldsConfig } from '@/types/listingFields';

export const taskFields: ListingFieldsConfig = {
    type: 'TASK',
    role: 'all',
    groups: [
        {
            title: '任务基本信息',
            fields: [
                {
                    name: 'title',
                    label: '任务标题',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：帮忙搬个沙发、周六帮忙去机场接人',
                },
                {
                    name: 'description',
                    label: '任务详情',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '请详细描述任务内容、所需技能和具体要求...',
                    rows: 6,
                },
                {
                    name: 'images',
                    label: '现场/参考图 (可选)',
                    type: 'images',
                    importance: 'optional',
                    helpText: '上传现场照片可以帮助执行者更快评估',
                }
            ]
        },
        {
            title: '酬劳与时间',
            fields: [
                {
                    name: 'price',
                    label: '报酬金额 (CAD)',
                    type: 'number',
                    importance: 'required',
                    placeholder: '30.00',
                    helpText: '任务完成后支付给执行者'
                },
                {
                    name: 'urgency',
                    label: '紧急程度',
                    type: 'select',
                    importance: 'recommended',
                    options: [
                        { value: 'NORMAL', label: '普通' },
                        { value: 'URGENT', label: '火急火燎 (尽快)' },
                        { value: 'SCHEDULED', label: '预约时间' },
                    ]
                },
                {
                    name: 'deadline',
                    label: '截止日期',
                    type: 'datetime',
                    importance: 'recommended',
                    placeholder: '2024-01-20',
                }
            ]
        },
        {
            title: '位置信息',
            fields: [
                {
                    name: 'location',
                    label: '任务地点',
                    type: 'location',
                    importance: 'required',
                    placeholder: '例如：Lees Ave / 网上办公',
                }
            ]
        }
    ]
};
