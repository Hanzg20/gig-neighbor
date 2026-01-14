/**
 * QR码Logo演示组件
 * 用于测试和展示带logo的二维码效果
 *
 * 使用方法：
 * 1. 在任意页面导入此组件
 * 2. <QrLogoDemo />
 * 3. 查看不同配置的二维码效果
 */

import { useState } from 'react';
import { QrCodeGenerator } from './QrCodeGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function QrLogoDemo() {
    const [url, setUrl] = useState('https://gigneighbor.ca/scan/demo-123456');
    const [logoUrl, setLogoUrl] = useState('/qr-logo.png');
    const [logoSize, setLogoSize] = useState(18);
    const [showLogo, setShowLogo] = useState(true);
    const [qrSize, setQrSize] = useState(200);
    const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">QR码Logo演示 | QR Code Logo Demo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 左侧：预览 */}
                <Card>
                    <CardHeader>
                        <CardTitle>预览 Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300">
                            <QrCodeGenerator
                                value={url}
                                size={qrSize}
                                logoUrl={showLogo ? logoUrl : undefined}
                                logoSize={logoSize}
                                level={level}
                            />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>QR码尺寸: {qrSize}px</p>
                            <p>Logo尺寸: {showLogo ? `${Math.round(qrSize * logoSize / 100)}px (${logoSize}%)` : '无Logo'}</p>
                            <p>纠错级别: {level} ({
                                level === 'L' ? '7%' :
                                level === 'M' ? '15%' :
                                level === 'Q' ? '25%' : '30%'
                            })</p>
                        </div>

                        <Button
                            onClick={() => {
                                // 用手机扫描测试
                                alert('请使用手机相机扫描上方二维码进行测试！\n\nTest by scanning with your phone camera!');
                            }}
                            className="w-full"
                        >
                            📱 用手机测试扫描 Test Scan
                        </Button>
                    </CardContent>
                </Card>

                {/* 右侧：配置面板 */}
                <Card>
                    <CardHeader>
                        <CardTitle>配置 Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* URL配置 */}
                        <div className="space-y-2">
                            <Label htmlFor="url">QR码内容 URL</Label>
                            <Input
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="输入URL或文本"
                            />
                        </div>

                        {/* Logo开关 */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showLogo">显示Logo</Label>
                            <Switch
                                id="showLogo"
                                checked={showLogo}
                                onCheckedChange={setShowLogo}
                            />
                        </div>

                        {/* Logo URL */}
                        {showLogo && (
                            <div className="space-y-2">
                                <Label htmlFor="logoUrl">Logo图片URL</Label>
                                <Input
                                    id="logoUrl"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="/qr-logo.png"
                                />
                                <p className="text-xs text-muted-foreground">
                                    默认: /qr-logo.png（QR码专用logo，放在public目录）
                                </p>
                            </div>
                        )}

                        {/* Logo尺寸滑块 */}
                        {showLogo && (
                            <div className="space-y-2">
                                <Label>Logo尺寸: {logoSize}%</Label>
                                <Slider
                                    value={[logoSize]}
                                    onValueChange={(value) => setLogoSize(value[0])}
                                    min={10}
                                    max={30}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>10% (安全)</span>
                                    <span>18% (推荐)</span>
                                    <span>30% (最大)</span>
                                </div>
                            </div>
                        )}

                        {/* QR码尺寸 */}
                        <div className="space-y-2">
                            <Label>QR码尺寸: {qrSize}px</Label>
                            <Slider
                                value={[qrSize]}
                                onValueChange={(value) => setQrSize(value[0])}
                                min={100}
                                max={400}
                                step={50}
                                className="w-full"
                            />
                        </div>

                        {/* 纠错级别 */}
                        <div className="space-y-2">
                            <Label>纠错级别</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['L', 'M', 'Q', 'H'] as const).map((l) => (
                                    <Button
                                        key={l}
                                        variant={level === l ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setLevel(l)}
                                    >
                                        {l}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                L=7% | M=15% | Q=25% | H=30% (推荐带logo使用H级)
                            </p>
                        </div>

                        {/* 预设配置 */}
                        <div className="space-y-2">
                            <Label>快捷预设</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowLogo(true);
                                        setLogoSize(18);
                                        setLevel('H');
                                        setQrSize(200);
                                    }}
                                >
                                    📄 推荐配置
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowLogo(true);
                                        setLogoSize(25);
                                        setLevel('H');
                                        setQrSize(300);
                                    }}
                                >
                                    🎨 醒目Logo
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowLogo(false);
                                        setLevel('M');
                                        setQrSize(150);
                                    }}
                                >
                                    📱 纯净简洁
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowLogo(true);
                                        setLogoSize(15);
                                        setLevel('H');
                                        setQrSize(400);
                                    }}
                                >
                                    🖨️ 打印优化
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 对比展示 */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>对比展示 Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <QrCodeGenerator value={url} size={150} />
                            <p className="text-sm mt-2">无Logo</p>
                        </div>
                        <div className="text-center">
                            <QrCodeGenerator value={url} size={150} logoUrl="/qr-logo.png" logoSize={15} />
                            <p className="text-sm mt-2">15% Logo</p>
                        </div>
                        <div className="text-center">
                            <QrCodeGenerator value={url} size={150} logoUrl="/qr-logo.png" logoSize={20} />
                            <p className="text-sm mt-2">20% Logo</p>
                        </div>
                        <div className="text-center">
                            <QrCodeGenerator value={url} size={150} logoUrl="/qr-logo.png" logoSize={25} />
                            <p className="text-sm mt-2">25% Logo</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 使用提示 */}
            <Card className="mt-8 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <h3 className="font-bold mb-2">💡 使用提示 Tips</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>带Logo时建议使用<strong>H级纠错</strong>（30%容错率）</li>
                        <li>Logo占比推荐<strong>15-20%</strong>，最大不超过30%</li>
                        <li>确保logo图片为<strong>方形</strong>，PNG格式带透明背景最佳</li>
                        <li>打印前请使用手机<strong>实际扫描测试</strong></li>
                        <li>QR专用logo文件：<code>public/qr-logo.png</code></li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
