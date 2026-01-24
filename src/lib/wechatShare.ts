/**
 * 微信分享配置工具
 *
 * 要实现微信分享卡片预览效果，需要：
 * 1. 在微信公众平台注册并获取 AppID
 * 2. 配置 JS 安全域名
 * 3. 后端生成签名 (signature)
 * 4. 前端调用 wx.config 和 wx.updateAppMessageShareData
 *
 * 注意：微信分享卡片需要服务端配合，纯前端无法实现
 */

// 微信 JS-SDK 类型定义
declare global {
    interface Window {
        wx?: {
            config: (config: WxConfig) => void;
            ready: (callback: () => void) => void;
            error: (callback: (res: any) => void) => void;
            updateAppMessageShareData: (config: WxShareConfig) => void;
            updateTimelineShareData: (config: WxShareConfig) => void;
        };
    }
}

interface WxConfig {
    debug?: boolean;
    appId: string;
    timestamp: number;
    nonceStr: string;
    signature: string;
    jsApiList: string[];
}

interface WxShareConfig {
    title: string;
    desc: string;
    link: string;
    imgUrl: string;
    success?: () => void;
    fail?: (err: any) => void;
}

interface ShareData {
    title: string;
    description: string;
    imageUrl: string;
    url: string;
}

/**
 * 加载微信 JS-SDK
 */
export function loadWxJsSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.wx) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load WeChat JS-SDK'));
        document.head.appendChild(script);
    });
}

/**
 * 获取微信分享签名 (需要后端接口)
 *
 * 后端需要：
 * 1. 获取 access_token: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 * 2. 获取 jsapi_ticket: GET https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi
 * 3. 生成签名: sha1(jsapi_ticket=XXX&noncestr=XXX&timestamp=XXX&url=XXX)
 */
export async function getWxSignature(url: string): Promise<{
    appId: string;
    timestamp: number;
    nonceStr: string;
    signature: string;
} | null> {
    try {
        // TODO: 替换为你的后端接口
        const response = await fetch(`/api/wechat/signature?url=${encodeURIComponent(url)}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Failed to get WeChat signature:', error);
        return null;
    }
}

/**
 * 配置微信分享
 */
export async function configWxShare(shareData: ShareData): Promise<boolean> {
    try {
        // 1. 加载 JS-SDK
        await loadWxJsSdk();

        // 2. 获取签名
        const signData = await getWxSignature(shareData.url);
        if (!signData) {
            console.warn('WeChat signature not available, falling back to default share');
            return false;
        }

        // 3. 配置 wx.config
        window.wx?.config({
            debug: false,
            appId: signData.appId,
            timestamp: signData.timestamp,
            nonceStr: signData.nonceStr,
            signature: signData.signature,
            jsApiList: [
                'updateAppMessageShareData',
                'updateTimelineShareData'
            ]
        });

        // 4. 配置分享内容
        window.wx?.ready(() => {
            // 分享给朋友
            window.wx?.updateAppMessageShareData({
                title: shareData.title,
                desc: shareData.description,
                link: shareData.url,
                imgUrl: shareData.imageUrl,
                success: () => console.log('WeChat share configured'),
                fail: (err) => console.error('WeChat share config failed:', err)
            });

            // 分享到朋友圈
            window.wx?.updateTimelineShareData({
                title: shareData.title,
                desc: shareData.description,
                link: shareData.url,
                imgUrl: shareData.imageUrl,
                success: () => console.log('WeChat timeline share configured'),
                fail: (err) => console.error('WeChat timeline share config failed:', err)
            });
        });

        window.wx?.error((res) => {
            console.error('WeChat JS-SDK error:', res);
        });

        return true;
    } catch (error) {
        console.error('Failed to configure WeChat share:', error);
        return false;
    }
}

/**
 * 更新页面的 Open Graph 元标签
 * 注意：这对微信爬虫无效（因为爬虫不执行 JS），但对其他平台有用
 */
export function updateOpenGraphTags(data: ShareData): void {
    const setMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    };

    setMetaTag('og:title', data.title);
    setMetaTag('og:description', data.description);
    setMetaTag('og:image', data.imageUrl);
    setMetaTag('og:url', data.url);
    setMetaTag('og:type', 'article');

    // Twitter Card
    const setTwitterTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
        }
        meta.content = content;
    };

    setTwitterTag('twitter:card', 'summary_large_image');
    setTwitterTag('twitter:title', data.title);
    setTwitterTag('twitter:description', data.description);
    setTwitterTag('twitter:image', data.imageUrl);

    // 更新页面标题
    document.title = `${data.title} - 渥帮 JUSTWEDO`;
}

/**
 * 检测是否在微信浏览器中
 */
export function isWeChatBrowser(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
}

/**
 * 检测是否在移动端
 */
export function isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
