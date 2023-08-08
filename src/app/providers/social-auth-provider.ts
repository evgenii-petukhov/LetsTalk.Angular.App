import {
    FacebookLoginProvider,
    LoginProvider,
    SocialAuthServiceConfig,
    VKLoginProvider
} from '@abacritt/angularx-social-login';
import { environment } from 'src/environments/environment';

const getProviders = (): Array<{
    id: string;
    provider: LoginProvider;
}> => {
    const providers = [];
    const env = (environment as any);
    if (env.login.facebookAppId) {
        providers.push({
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(env.login.facebookAppId),
        });
    }
    if (env.login.vkAppId) {
        providers.push({
            id: VKLoginProvider.PROVIDER_ID,
            provider: new VKLoginProvider(env.login.vkAppId),
        });
    }
    return providers;
};

export const socialAuthProvider =
{
    provide: 'SocialAuthServiceConfig',
    useValue: {
        autoLogin: false,
        providers: getProviders()
    } as SocialAuthServiceConfig,
};
