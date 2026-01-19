import { ListingFieldsConfig } from '@/types/listingFields';

export const eventFields: ListingFieldsConfig = {
    type: 'EVENT',
    role: 'all',
    groups: [
        {
            title: '活动基本信息',
            fields: [
                {
                    name: 'title',
                    label: '活动主题',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：周末桌游聚会、羽毛球组队',
                },
                {
                    name: 'images',
                    label: '活动海报/封面',
                    type: 'images',
                    importance: 'required',
                },
                {
                    name: 'description',
                    label: '活动详细信息',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '请说明活动流程、费用说明、注意事项等...',
                    rows: 6,
                }
            ]
        },
        {
            title: '时间与地点',
            fields: [
                {
                    name: 'eventTime',
                    label: '活动开始时间',
                    type: 'datetime',
                    importance: 'required',
                },
                {
                    name: 'location',
                    label: '活动地点',
                    type: 'location',
                    importance: 'required',
                }
            ]
        },
        {
            title: '参与限制',
            fields: [
                {
                    name: 'maxParticipants',
                    label: '人数限制',
                    type: 'number',
                    importance: 'recommended',
                    placeholder: '0 表示不限',
                },
                {
                    name: 'price',
                    label: '报名费/人均费用 (CAD)',
                    type: 'number',
                    importance: 'required',
                    placeholder: '0',
                    helpText: '0 表示免费活动'
                },
                {
                    name: 'contact',
                    label: '组织者联系方式',
                    type: 'contact',
                    importance: 'required',
                }
            ]
        }
    ]
};
