import { ListingFieldsConfig } from '@/types/listingFields';

/**
 * Field definitions for SERVICE type - Provider (Professional services)
 */
export const providerServiceFields: ListingFieldsConfig = {
    type: 'SERVICE',
    role: 'provider',
    groups: [
        {
            title: '服务基础信息',
            fields: [
                {
                    name: 'title',
                    label: '服务名称',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：专业房屋保洁、理财咨询',
                    validation: {
                        min: 5,
                        max: 100,
                    }
                },
                {
                    name: 'images',
                    label: '服务展示图片',
                    type: 'images',
                    importance: 'required',
                    helpText: '上传1-6张图，可以是工作照、证书或服务案例',
                    validation: {
                        min: 1,
                        max: 6,
                    }
                },
                {
                    name: 'description',
                    label: '服务详细说明',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '详细介绍您的服务内容、流程及专业优势...',
                    rows: 6,
                },
                {
                    name: 'mediaUrl',
                    label: '展示视频 (YouTube/B站)',
                    type: 'text',
                    importance: 'optional',
                    placeholder: '粘贴 YouTube 或 B站视频链接',
                    helpText: '展示服务演示或作品集视频，提升客户信任',
                }
            ]
        },
        {
            title: '交易模式与定价',
            fields: [
                {
                    name: 'pricingMode',
                    label: '预定/交易模式',
                    type: 'select',
                    importance: 'required',
                    options: [
                        { value: 'FIXED', label: '一口价/套餐 (买家可直接付款预定)' },
                        { value: 'QUOTE', label: '先询价/报价 (买家发起咨询单)' },
                        { value: 'NEGOTIABLE', label: '价格面议 (仅支持私信沟通)' }
                    ],
                    helpText: '选择合适的交易模式，系统将匹配不同的订单流程'
                },
                {
                    name: 'skus',
                    label: '服务规格/价格方案',
                    type: 'sku-list',
                    importance: 'required',
                    conditional: {
                        dependsOn: 'pricingMode',
                        value: 'FIXED'
                    },
                    helpText: '您可以设置多个服务档位，如：基础咨询、深度评估、年度包等。',
                }
            ]
        },
        {
            title: '服务范围与规则',
            fields: [
                {
                    name: 'serviceArea',
                    label: '服务区域',
                    type: 'location',
                    importance: 'required',
                    placeholder: '例如：Kanata, Barrhaven, 全Ottawa',
                },
                {
                    name: 'bookingRequired',
                    label: '需提前预约',
                    type: 'select',
                    importance: 'recommended',
                    options: [
                        { value: 'NONE', label: '无需预约' },
                        { value: '1_DAY', label: '需提前1天' },
                        { value: '2_DAYS', label: '需提前2天' },
                        { value: '1_WEEK', label: '需提前1周' },
                    ]
                },
                {
                    name: 'cancelPolicy',
                    label: '取消政策',
                    type: 'textarea',
                    importance: 'recommended',
                    placeholder: '例如：提前24小时免费取消，否则收取50%费用',
                    rows: 2,
                }
            ]
        }
    ]
};
