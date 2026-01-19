import { ListingFieldsConfig } from '@/types/listingFields';

export const wantedFields: ListingFieldsConfig = {
    type: 'GOODS',
    role: 'buyer',
    groups: [
        {
            title: '我想求购',
            fields: [
                {
                    name: 'title',
                    label: '想要的物品/服务',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：求购二手显示器、寻求搬家服务',
                },
                {
                    name: 'description',
                    label: '详细要求',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '请详细说明您的需求、期望的成色或服务内容...',
                    rows: 5,
                },
                {
                    name: 'images',
                    label: '参考图 (可选)',
                    type: 'images',
                    importance: 'optional',
                    helpText: '上传一张参考图可以帮您更快找到目标',
                }
            ]
        },
        {
            title: '预算与时间',
            fields: [
                {
                    name: 'price',
                    label: '我的预算 (CAD)',
                    type: 'number',
                    importance: 'recommended',
                    placeholder: '0.00',
                    helpText: '填0表示面议'
                },
                {
                    name: 'neededBy',
                    label: '期望获得日期',
                    type: 'datetime',
                    importance: 'optional',
                }
            ]
        }
    ]
};
