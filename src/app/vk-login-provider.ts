import { BaseLoginProvider } from './entities/base-login-provider';
import { SocialUser } from './entities/social-user';

declare let VK: any;

const permissionTypes = [
  'notify', 
  'friends', 
  'photos', 
  'audio',
  'video', 
  'offers', 
  'questions', 
  'pages', 
  'links', 
  'status', 
  'notes',
  'messages',
  'wall',
  'ads',
  'offline',
  'docs',
  'groups',
  'notifications',
  'stats',
  'email',
  'market'
];

export class VKLoginProvider extends BaseLoginProvider {
  constructor(
    private clientId: string,
    private initOptions = {
      fields: 'photo_max,contacts',
      version: '5.131',
    }
  ) {
    super();
  }

  public static readonly PROVIDER_ID: string = 'VK';

  private readonly VK_API_URL = '//vk.com/js/api/openapi.js';
  private readonly VK_API_GET_USER = 'users.get';

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.loadScript(
          VKLoginProvider.PROVIDER_ID,
          this.VK_API_URL,
          () => {
            VK.init({
              apiId: this.clientId,
            });

            resolve();
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  getLoginStatus(): Promise<SocialUser> {
    return new Promise<SocialUser>((resolve: (value: SocialUser | PromiseLike<SocialUser>) => void) =>
      this.getLoginStatusInternal(resolve)
    );
  }

  signIn(permissions: string[]): Promise<SocialUser> {
    if (permissions.includes('offers')) {
      console.warn('The "offers" permission is outdated.');
    }

    if (permissions.includes('questions')) {
      console.warn('The "questions" permission is outdated.');
    }

    if (permissions.includes('messages')) {
      console.warn('The "messages" permission is unavailable for non-standalone applications.');
    }

    const scope = permissions.reduce((accumulator, current) => {
        const index = permissionTypes.findIndex(pt => pt === current);
        return index > -1 ? accumulator + Math.pow(2, index) : 0;
      }, 0);

    return new Promise<SocialUser>((resolve: (value: SocialUser | PromiseLike<SocialUser>) => void) =>
      this.signInInternal(resolve, scope)
    );
  }

  signOut(): Promise<void> {
    return new Promise((resolve: (value: void | PromiseLike<void>) => void) => {
      VK.Auth.logout(() => {
        resolve();
      });
    });
  }

  private signInInternal(
    resolve: (value: SocialUser | PromiseLike<SocialUser>) => void, 
    scope:any
  ) {
    VK.Auth.login((loginResponse: any) => {
      if (loginResponse.status === 'connected') {
        this.getUser(
          loginResponse.session.mid,
          loginResponse.session.sid,
          resolve
        );
      }
    }, scope);
  }

  private getUser(
    userId: number, 
    token: string, 
    resolve: (value: SocialUser | PromiseLike<SocialUser>) => void
  ) {
    VK.Api.call(
      this.VK_API_GET_USER,
      {
        user_id: userId,
        fields: this.initOptions.fields,
        v: this.initOptions.version,
      },
      (userResponse: any) => {
        resolve(
          this.createUser(
            Object.assign({}, { token }, userResponse.response[0])
          )
        );
      }
    );
  }

  private getLoginStatusInternal(resolve: (value: SocialUser | PromiseLike<SocialUser>) => void) {
    VK.Auth.getLoginStatus((loginResponse: any) => {
      if (loginResponse.status === 'connected') {
        this.getUser(
          loginResponse.session.mid,
          loginResponse.session.sid,
          resolve
        );
      }
    });
  }

  private createUser(response: any): SocialUser {
    const user: SocialUser = new SocialUser();
    user.id = response.id;
    user.name = `${response.first_name} ${response.last_name}`;
    user.photoUrl = response.photo_max;
    user.authToken = response.token;
    return user;
  }
}
