type SourceType = 'supplier_tool' | 'selly_admin';

interface InitProps {
  userToken: string;
  fcmToken: string;
  deviceId: string;
  source: SourceType;
  env: 'development' | 'production';
}

let nIntervalId: number | undefined;
let APP_ENV: string;
let AUTH_INFO = {
  userToken: '',
  fcmToken: '',
  deviceId: '',
  source: '',
};

export class SellyChat {
  private genQueryParams(): string {
    return new URLSearchParams(AUTH_INFO).toString();
  }

  private setupStyled() {
    const styles = `@keyframes fb_bounce_out_v2{0%{opacity:1;transform:scale(1,1);transform-origin:bottom right}100%{opacity:0;transform:scale(0,0);transform-origin:bottom right}}@keyframes fb_bounce_in_v2{0%{opacity:0;transform:scale(0,0);transform-origin:bottom right}50%{opacity:0;transform:scale(0,0);transform-origin:bottom right}75%{transform:scale(1.03,1.03);transform-origin:bottom right}100%{opacity:1;transform:scale(1,1);transform-origin:bottom right}}.bubble,.circle{transform-origin:50%}.chat{display:flex;position:fixed;bottom:20px;right:20px;z-index:999;transition:bottom 400ms}.background{background-color:#c36;border-radius:50%;box-shadow:0 2.1px 1.3px rgba(0,0,0,.044),0 5.9px 4.2px rgba(0,0,0,.054),0 12.6px 9.5px rgba(0,0,0,.061),0 25px 20px rgba(0,0,0,.1);height:48px;left:6px;position:absolute;top:6px;width:48px}.chat-bubble{cursor:pointer;position:relative;width:60px;height:60px}.bubble{transition:transform 0.5s cubic-bezier(.17,.61,.54,.9)}.line{fill:none;stroke:#fff;stroke-width:2.75;stroke-linecap:round;transition:stroke-dashoffset 0.5s cubic-bezier(.4,0,.2,1)}.line1{stroke-dasharray:60 90;stroke-dashoffset:-20}.line2{stroke-dasharray:67 87;stroke-dashoffset:-18}.circle{fill:#fff;stroke:none;transition:transform 0.5s cubic-bezier(.4,0,.2,1)}.chat.active .bubble{transform:translateX(24px) translateY(4px) rotate(45deg)}.chat.active .line1{stroke-dashoffset:21}.chat.active .line2{stroke-dashoffset:30}.chat.active .circle{transform:scale(0)}.chat-box{border:0;background:#fff;user-select:none;border:0!important;position:fixed;z-index:999;box-shadow:0 2.1px 1.3px rgb(0 0 0 / 4%),0 5.9px 4.2px rgb(0 0 0 / 5%),0 12.6px 9.5px rgb(0 0 0 / 6%),0 25px 20px rgb(0 0 0 / 10%);top:0;left:0;right:0;bottom:0;height:100%;width:100%;border-radius:0;transform:translate3d(0,120%,0);transition:top 400ms,transform 400ms cubic-bezier(.33,1,.68,1);overflow:hidden;display:flex;flex-direction:column}.chat-box.active{transform:translate3d(0,0,0)}.chat-box .actions{padding:16px 12px 0 12px}.chat-box .actions__head{padding:0 4px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}.chat-box .actions__head-title{font-weight:500;font-size:1.5rem;line-height:2rem}.chat-box iframe{border:0;width:100%;height:100%}.full-screen{height:100vh;width:100%;bottom:0;left:0;border-radius:0}.actions-icon{font-size:1.35rem;font-weight:500;margin-right:8px;cursor:pointer}@media (min-width:767px){.chat-bubble{width:80px;height:80px}.chat-box{animation-name:fb_bounce_out_v2;max-height:0;animation-duration:0.3s;transition-timing-function:ease-in;left:auto;top:auto;right:20px;bottom:100px;border-radius:10px;height:550px;width:400px}.chat-box.active{user-select:none;animation-name:fb_bounce_in_v2;max-height:inherit;animation-duration:0.3s;transition-timing-function:ease-in}.background{height:64px;left:8px;position:absolute;top:8px;width:64px}}`;
    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }

  private initFontAwesome() {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://use.fontawesome.com/02175bdbd6.js';
    document.body.appendChild(script);
  }

  private createButtonChat() {
    const template = `
        <div class="chat" id="chat-button" onclick="this.classList.toggle('active');SellyChat.createChat()">
          <div class="background"></div>
          <svg class="chat-bubble" width="80" height="80" viewBox="0 0 100 100">
            <g class="bubble">
              <path class="line line1" d="M 30.7873,85.113394 30.7873,46.556405 C 30.7873,41.101961
              36.826342,35.342 40.898074,35.342 H 59.113981 C 63.73287,35.342
              69.29995,40.103201 69.29995,46.784744"></path>
              <path class="line line2" d="M 13.461999,65.039335 H 58.028684 C
                63.483128,65.039335
                69.243089,59.000293 69.243089,54.928561 V 45.605853 C
                69.243089,40.986964 65.02087,35.419884 58.339327,35.419884"></path>
            </g>
            <circle class="circle circle1" r="1.9" cy="50.7" cx="42.5"></circle>
            <circle class="circle circle2" cx="49.9" cy="50.7" r="1.9"></circle>
            <circle class="circle circle3" r="1.9" cy="50.7" cx="57.3"></circle>
          </svg>
        </div>
      `;
    const body = document.getElementsByTagName('body')[0];
    body.insertAdjacentHTML('beforeend', template);
  }

  private createBoxChat() {
    const template = `
      <div class="chat-box" id="iframe-chat">
        <div class="actions">
          <div class="actions__head">
            <div class="actions__head-title">Tin nhắn</div>
            <div>
              <i onclick="SellyChat.fullscreen()" id="full-screen" class="actions-icon fa fa-arrows-alt" style="display: inline-block;"></i>
              <i onclick="SellyChat.hiddenChat()" id="close-chat" class="actions-icon fa fa-power-off"></i>
            </div>
          </div>
        </div>
        <iframe id="iframe-src"></iframe>
      </div>
    `;
    const body = document.getElementsByTagName('body')[0];
    body.insertAdjacentHTML('beforeend', template);
  }

  private initChat() {
    const iframeTag = document.getElementById('iframe-src') as HTMLIFrameElement;

    if (!iframeTag?.src) {
      let domain = 'https://chat.unibag.xyz';
      if (APP_ENV !== 'development') {
        domain = 'https://chat.selly.vn';
      }
      iframeTag.src = `${domain}/?${this.genQueryParams()}`;
    }

    this.visibleChatBox();
  }

  private setupChat() {
    if (AUTH_INFO.userToken) {
      clearInterval(nIntervalId);
      nIntervalId = undefined;

      this.createButtonChat();
      this.createBoxChat();
    }
  }

  public init(params: InitProps) {
    const { env = 'development', ...authInfo } = params;
    AUTH_INFO = authInfo;
    APP_ENV = env;
    this.initFontAwesome();
    this.setupStyled();
    nIntervalId = setInterval(this.setupChat, 1500);
  }

  public visibleChatBox() {
    const chatBox = document.getElementById('iframe-chat');
    chatBox?.classList?.toggle('active');
  }

  public destroy() {}

  public getUnreadMessage() {}
}
