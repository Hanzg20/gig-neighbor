import { ListingFieldsConfig } from '@/types/listingFields';

export const giveawayFields: ListingFieldsConfig = {
    type: 'GOODS', // Using GOODS type but flavored as giveaway
    role: 'all',
    groups: [
        {
            title: '赠送信息',
            fields: [
                {
                    name: 'title',
                    label: '物品名称',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：闲置搬家纸箱、多余的盆栽',
                },
                {
                    name: 'images',
                    label: '物品图片',
                    type: 'images',
                    importance: 'required',
                },
                {
                    name: 'description',
                    label: '详情说明',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '请说明物品新旧程度及领取方式...',
                    rows: 4,
                }
            ]
        },
        {
            title: '领取规则',
            fields: [
                {
                    name: 'price',
                    label: '价格',
                    type: 'number',
                    importance: 'required',
                    placeholder: '0',
                    // Locked to 0 in UI would be better, but for now we set default
                },
                {
                    name: 'pickupLocation',
                    label: '领取地点',
                    type: 'location',
                    importance: 'required',
                },
                {
                    name: 'giveawayCondition',
                    label: '赠送对象要求',
                    type: 'select',
                    importance: 'optional',
                    options: [
                        { value: 'ANYONE', label: '先到先得 (先联系先得)' },
                        { value: 'NEIGHBOR_ONLY', label: '认证邻居优先' },
                        { value: 'CHARITY', label: '优先给有需要的人' },
                    ]
                }
            ]
        }
    ]
};
