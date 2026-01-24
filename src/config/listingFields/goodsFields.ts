import { ListingFieldsConfig } from '@/types/listingFields';

/**
 * Field definitions for GOODS type - Buyer (individual selling second-hand items)
 */
export const buyerGoodsFields: ListingFieldsConfig = {
    type: 'GOODS',
    role: 'buyer',
    groups: [
        {
            title: '基础信息',
            fields: [
                {
                    name: 'title',
                    label: '商品名称',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：索尼 A7M4 相机',
                    helpText: '清晰的标题能吸引更多买家',
                    validation: {
                        min: 5,
                        max: 100,
                    }
                },
                {
                    name: 'images',
                    label: '商品图片',
                    type: 'images',
                    importance: 'required',
                    helpText: '上传1-6张清晰照片，展示商品各个角度',
                    validation: {
                        min: 1,
                        max: 6,
                    }
                },
                {
                    name: 'mediaUrl',
                    label: '展示视频 (YouTube/B站)',
                    type: 'text',
                    importance: 'optional',
                    placeholder: 'https://www.youtube.com/watch?v=...',
                    helpText: '支持 YouTube, Bilibili, Vimeo 等主流视频链接',
                },
                {
                    name: 'description',
                    label: '详细描述',
                    type: 'textarea',
                    importance: 'recommended',
                    placeholder: '详细说明使用感受、是否有瑕疵...',
                    rows: 5,
                }
            ]
        },
        {
            title: '成色与来源',
            fields: [
                {
                    name: 'condition',
                    label: '成色',
                    type: 'select',
                    importance: 'required',
                    options: [
                        { value: 'NEW', label: '全新未拆封' },
                        { value: 'LIKE_NEW', label: '几乎全新（使用1-3次）' },
                        { value: 'GOOD', label: '良好（轻微使用痕迹）' },
                        { value: 'FAIR', label: '可用（明显使用痕迹但功能正常）' },
                    ]
                },
                {
                    name: 'purchaseSource',
                    label: '购入渠道',
                    type: 'text',
                    importance: 'recommended',
                    placeholder: '例如：京东自营、亚马逊',
                    helpText: '正规渠道更容易获得买家信任',
                },
                {
                    name: 'purchaseDate',
                    label: '购入时间',
                    type: 'text',
                    importance: 'recommended',
                    placeholder: '例如：2023年6月',
                },
                {
                    name: 'sellingReason',
                    label: '转手原因',
                    type: 'text',
                    importance: 'recommended',
                    placeholder: '例如：升级设备、搬家不带走',
                },
                {
                    name: 'originalPrice',
                    label: '原价参考',
                    type: 'number',
                    importance: 'recommended',
                    placeholder: '当时购买的价格',
                    helpText: '方便买家判断性价比',
                }
            ]
        },
        {
            title: '交付与价格',
            fields: [
                {
                    name: 'deliveryMethods',
                    label: '交付方式',
                    type: 'checkbox',
                    importance: 'required',
                    multiple: true,
                    options: [
                        { value: 'PICKUP', label: '自提（推荐）' },
                        { value: 'DELIVERY', label: '送货上门' },
                        { value: 'SHIPPING', label: '快递邮寄' },
                    ]
                },
                {
                    name: 'pickupLocation',
                    label: '自提地点',
                    type: 'location',
                    importance: 'required',
                    placeholder: 'Kanata Lakes',
                    conditional: {
                        dependsOn: 'deliveryMethods',
                        value: 'PICKUP',
                        operator: 'includes',
                    }
                },
                {
                    name: 'deliveryRange',
                    label: '送货范围',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：Kanata周边10km',
                    conditional: {
                        dependsOn: 'deliveryMethods',
                        value: 'DELIVERY',
                        operator: 'includes',
                    }
                },
                {
                    name: 'shippingFee',
                    label: '快递费用',
                    type: 'number',
                    importance: 'required',
                    placeholder: '买家承担的快递费',
                    conditional: {
                        dependsOn: 'deliveryMethods',
                        value: 'SHIPPING',
                        operator: 'includes',
                    }
                },
                {
                    name: 'price',
                    label: '售价 (CAD)',
                    type: 'number',
                    importance: 'required',
                    placeholder: '0.00',
                    validation: {
                        min: 0,
                    }
                },
                {
                    name: 'negotiable',
                    label: '是否可议价',
                    type: 'checkbox',
                    importance: 'optional',
                    defaultValue: false,
                }
            ]
        }
    ]
};

/**
 * Field definitions for GOODS type - Provider (business selling products)
 */
export const providerGoodsFields: ListingFieldsConfig = {
    type: 'GOODS',
    role: 'provider',
    groups: [
        {
            title: '基础信息',
            fields: [
                {
                    name: 'title',
                    label: '商品名称',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：健身月卡、洗车套餐',
                    validation: {
                        min: 5,
                        max: 100,
                    }
                },
                {
                    name: 'images',
                    label: '商品图片',
                    type: 'images',
                    importance: 'required',
                    validation: {
                        min: 1,
                        max: 6,
                    }
                },
                {
                    name: 'mediaUrl',
                    label: '展示视频 (YouTube/B站)',
                    type: 'text',
                    importance: 'optional',
                    placeholder: 'https://www.youtube.com/watch?v=...',
                    helpText: '支持 YouTube, Bilibili, Vimeo 等主流视频链接',
                },
                {
                    name: 'description',
                    label: '商品描述',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '详细介绍商品或服务内容...',
                    rows: 6,
                }
            ]
        },
        {
            title: '价格规格与库存',
            fields: [
                {
                    name: 'skus',
                    label: '规格与价格清单',
                    type: 'sku-list',
                    importance: 'required',
                    helpText: '您可以添加多个规格，如：不同容量、不同套餐等。',
                },
                {
                    name: 'maxPerOrder',
                    label: '每单限购',
                    type: 'number',
                    importance: 'recommended',
                    placeholder: '例如：2',
                    helpText: '防止恶意囤货',
                }
            ]
        },
        {
            title: '有效期与使用',
            fields: [
                {
                    name: 'validity',
                    label: '有效期',
                    type: 'text',
                    importance: 'required',
                    placeholder: '例如：购买后30天内激活，激活后1个月有效',
                },
                {
                    name: 'usageInstructions',
                    label: '使用说明',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '详细说明如何使用、是否需要预约等...',
                    rows: 4,
                },
                {
                    name: 'restrictions',
                    label: '使用限制',
                    type: 'textarea',
                    importance: 'recommended',
                    placeholder: '例如：节假日不可用、需提前预约',
                    rows: 3,
                }
            ]
        },
        {
            title: '政策与定价',
            fields: [
                {
                    name: 'refundPolicy',
                    label: '退换政策',
                    type: 'textarea',
                    importance: 'required',
                    placeholder: '例如：未激活可退，激活后不退不换',
                    rows: 3,
                },
                {
                    name: 'price',
                    label: '售价 (CAD)',
                    type: 'number',
                    importance: 'required',
                    validation: {
                        min: 0,
                    }
                },
                {
                    name: 'promotion',
                    label: '优惠活动',
                    type: 'text',
                    importance: 'recommended',
                    placeholder: '例如：买2送1、新客8折',
                }
            ]
        }
    ]
};
