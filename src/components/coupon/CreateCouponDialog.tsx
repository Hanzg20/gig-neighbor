import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CouponCard, CouponData } from './CouponCard';
import { useConfigStore } from '@/stores/configStore';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shuffle, ArrowLeft, ArrowRight } from 'lucide-react';

interface CreateCouponDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    providerId: string;
    providerName: string;
    providerLogo?: string;
    onCreated?: (coupon: CouponData) => void;
}

const i18n = {
    zh: {
        title: '创建优惠券',
        preview: '预览优惠券',
        code: '优惠码',
        codePlaceholder: '如: SUMMER20',
        codeHint: '用户输入的优惠码，建议使用大写字母和数字',
        generate: '随机生成',
        name: '优惠券名称',
        namePlaceholder: '如: 夏日特惠',
        description: '描述 (可选)',
        descriptionPlaceholder: '优惠券使用说明...',
        discountType: '折扣类型',
        percentage: '百分比折扣',
        fixed: '固定金额',
        discountValue: '折扣数值',
        minPurchase: '最低消费',
        minPurchaseHint: '0 表示无门槛',
        maxDiscount: '最大折扣 (可选)',
        maxDiscountHint: '百分比折扣时的封顶金额',
        maxUses: '使用次数上限',
        maxUsesHint: '留空表示不限',
        validDays: '有效天数',
        cancel: '取消',
        next: '下一步: 预览',
        back: '返回修改',
        confirm: '确认创建',
        creating: '创建中...',
        success: '优惠券创建成功',
        error: '创建失败，请重试',
    },
    en: {
        title: 'Create Coupon',
        preview: 'Preview Coupon',
        code: 'Coupon Code',
        codePlaceholder: 'e.g., SUMMER20',
        codeHint: 'The code users will enter. Use uppercase letters and numbers.',
        generate: 'Generate',
        name: 'Coupon Name',
        namePlaceholder: 'e.g., Summer Sale',
        description: 'Description (optional)',
        descriptionPlaceholder: 'Coupon usage instructions...',
        discountType: 'Discount Type',
        percentage: 'Percentage',
        fixed: 'Fixed Amount',
        discountValue: 'Discount Value',
        minPurchase: 'Min. Purchase',
        minPurchaseHint: '0 means no minimum',
        maxDiscount: 'Max Discount (optional)',
        maxDiscountHint: 'Cap for percentage discounts',
        maxUses: 'Max Uses',
        maxUsesHint: 'Leave empty for unlimited',
        validDays: 'Valid Days',
        cancel: 'Cancel',
        next: 'Next: Preview',
        back: 'Back',
        confirm: 'Create Coupon',
        creating: 'Creating...',
        success: 'Coupon created successfully',
        error: 'Failed to create coupon',
    }
};

// 生成随机优惠码
function generateCouponCode(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export function CreateCouponDialog({
    open,
    onOpenChange,
    providerId,
    providerName,
    providerLogo,
    onCreated
}: CreateCouponDialogProps) {
    const { language } = useConfigStore();
    const { toast } = useToast();
    const t = i18n[language] || i18n.en;

    const [step, setStep] = useState<'form' | 'preview'>('form');
    const [saving, setSaving] = useState(false);

    // 表单状态
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [minPurchase, setMinPurchase] = useState('0');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [validDays, setValidDays] = useState('30');

    // 重置表单
    const resetForm = () => {
        setStep('form');
        setCode('');
        setName('');
        setDescription('');
        setDiscountType('percentage');
        setDiscountValue('');
        setMinPurchase('0');
        setMaxDiscount('');
        setMaxUses('');
        setValidDays('30');
    };

    // 关闭时重置
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    };

    // 预览数据
    const previewData: CouponData = {
        id: 'preview',
        code: code || 'XXXXXXXX',
        name: name || '优惠券',
        description,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        minPurchase: parseFloat(minPurchase) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        validUntil: new Date(Date.now() + parseInt(validDays || '30') * 86400000).toISOString(),
        providerName,
        providerLogo
    };

    // 表单验证
    const isFormValid = code && name && discountValue && parseFloat(discountValue) > 0;

    // 保存优惠券
    const handleSave = async () => {
        if (!isFormValid) return;

        setSaving(true);
        try {
            const validUntil = new Date(Date.now() + parseInt(validDays || '30') * 86400000);

            const { data, error } = await supabase
                .from('provider_coupons')
                .insert({
                    provider_id: providerId,
                    code: code.toUpperCase(),
                    name,
                    description: description || null,
                    discount_type: discountType,
                    discount_value: parseFloat(discountValue),
                    min_purchase: parseFloat(minPurchase) || 0,
                    max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
                    max_uses: maxUses ? parseInt(maxUses) : null,
                    valid_until: validUntil.toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            toast({
                title: t.success,
                variant: 'default'
            });

            const createdCoupon: CouponData = {
                ...previewData,
                id: data.id,
                code: data.code,
            };

            onCreated?.(createdCoupon);
            handleOpenChange(false);
        } catch (error) {
            console.error('Failed to create coupon:', error);
            toast({
                title: t.error,
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'form' ? t.title : t.preview}
                    </DialogTitle>
                </DialogHeader>

                {step === 'form' ? (
                    <div className="space-y-5">
                        {/* 优惠码 */}
                        <div className="space-y-2">
                            <Label>{t.code} *</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    placeholder={t.codePlaceholder}
                                    className="font-mono"
                                    maxLength={20}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => setCode(generateCouponCode())}
                                    type="button"
                                >
                                    <Shuffle className="w-4 h-4 mr-2" />
                                    {t.generate}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">{t.codeHint}</p>
                        </div>

                        {/* 名称 */}
                        <div className="space-y-2">
                            <Label>{t.name} *</Label>
                            <Input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder={t.namePlaceholder}
                                maxLength={100}
                            />
                        </div>

                        {/* 描述 */}
                        <div className="space-y-2">
                            <Label>{t.description}</Label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder={t.descriptionPlaceholder}
                                rows={2}
                            />
                        </div>

                        {/* 折扣类型 */}
                        <div className="space-y-2">
                            <Label>{t.discountType} *</Label>
                            <RadioGroup
                                value={discountType}
                                onValueChange={v => setDiscountType(v as 'percentage' | 'fixed')}
                            >
                                <div className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="percentage" id="percentage" />
                                        <Label htmlFor="percentage" className="cursor-pointer">
                                            {t.percentage}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="fixed" id="fixed" />
                                        <Label htmlFor="fixed" className="cursor-pointer">
                                            {t.fixed}
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* 折扣数值 + 最低消费 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>
                                    {t.discountValue} *
                                    <span className="text-muted-foreground ml-1">
                                        ({discountType === 'percentage' ? '%' : '$'})
                                    </span>
                                </Label>
                                <Input
                                    type="number"
                                    value={discountValue}
                                    onChange={e => setDiscountValue(e.target.value)}
                                    placeholder={discountType === 'percentage' ? '20' : '5'}
                                    min="0"
                                    max={discountType === 'percentage' ? '100' : undefined}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.minPurchase} ($)</Label>
                                <Input
                                    type="number"
                                    value={minPurchase}
                                    onChange={e => setMinPurchase(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground">{t.minPurchaseHint}</p>
                            </div>
                        </div>

                        {/* 最大折扣 (百分比时显示) */}
                        {discountType === 'percentage' && (
                            <div className="space-y-2">
                                <Label>{t.maxDiscount} ($)</Label>
                                <Input
                                    type="number"
                                    value={maxDiscount}
                                    onChange={e => setMaxDiscount(e.target.value)}
                                    placeholder="10"
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground">{t.maxDiscountHint}</p>
                            </div>
                        )}

                        {/* 使用次数 + 有效天数 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t.maxUses}</Label>
                                <Input
                                    type="number"
                                    value={maxUses}
                                    onChange={e => setMaxUses(e.target.value)}
                                    placeholder={t.maxUsesHint}
                                    min="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.validDays}</Label>
                                <Input
                                    type="number"
                                    value={validDays}
                                    onChange={e => setValidDays(e.target.value)}
                                    placeholder="30"
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* 按钮 */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => handleOpenChange(false)}>
                                {t.cancel}
                            </Button>
                            <Button
                                onClick={() => setStep('preview')}
                                disabled={!isFormValid}
                            >
                                {t.next}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-4">
                        <CouponCard coupon={previewData} showActions={false} />

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={() => setStep('form')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t.back}
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.creating}
                                    </>
                                ) : (
                                    t.confirm
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default CreateCouponDialog;
