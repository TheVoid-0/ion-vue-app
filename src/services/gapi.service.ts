import { BehaviorSubject, Observable, firstValueFrom } from "rxjs";

const script = document.createElement('script');

class GoogleApiService {

    private gapi: any;
    private googleAuth: any;
    private isReady: BehaviorSubject<any | undefined> = new BehaviorSubject<boolean | undefined>(undefined);

    constructor() {
        console.log('construtor');
        const apiUrl = 'https://apis.google.com/js/api.js'
        script.type = "text/javascript"
        script.src = apiUrl
        script.onload = this.onLoad.bind(this);
        script.setAttribute('onreadystatechange', 'script.onload')
        document.getElementsByTagName('head')[0].appendChild(script)
    }

    private onLoad() {
        console.log('onload')
        if (!(script as any).readyState || /loaded|complete/.test((script as any).readyState)) {
            this.gapi = (window as any).gapi;
            this.gapi.load('client:auth2', this.initClient.bind(this));
            console.log('script carregado', this.gapi)
        } else {
            console.log('Script não carregou corretamente')
            this.isReady.error('Não carregou corretamente');
            // TODO: script não carregou corretamente
        }
    }

    private initClient() {
        console.log('init client')
        // In practice, your app can retrieve one or more discovery documents.
        const discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

        // Initialize the gapi.client object, which app uses to make API requests.
        // Get API key and client ID from API Console.
        // 'scope' field specifies space-delimited list of access scopes.

        this.gapi.client.init({
            'apiKey': 'AIzaSyD1Xy1bN1-zIzATtNz7ihEFAP_y4MXSmlA',
            'clientId': '290913271804-1hfebu8o9l9g2303dpg91be2sqkre620.apps.googleusercontent.com',
            'discoveryDocs': [discoveryUrl],
            'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly'
        }).then(() => {
            console.log('gClient inicializado');
            this.isReady.next(this.gapi);
        })
    }

    setSignInStateChangeListener(callback: Function) {
        this.googleAuth.isSignedIn.listen(callback);
    }

    getSignInStateChange() {
        return new Observable(subscribe => {
            // Listen for sign-in state changes.
            this.googleAuth.isSignedIn.listen(() => {
                console.log('mudo');
                if (this.googleAuth.isSignedIn.get()) {
                    subscribe.next(true)
                } else {
                    subscribe.next(false);
                }
                subscribe.complete();
            });
        });
    }

    getAuthInstance(): Observable<any> {
        return new Observable(subscribe => {
            this.isReady.subscribe({
                next: (gapi) => {
                    if (!gapi) {
                        return
                    }
                    this.googleAuth = gapi.auth2.getAuthInstance();
                    subscribe.next(this.googleAuth);
                }, error: (error) => {
                    console.log(error);
                }
            })
        });
    }

    async getCurrentUser(): Promise<any> {
        const googleAuth = await firstValueFrom(this.getAuthInstance());
        return googleAuth.currentUser.get();
    }

    onReady() {
        return this.isReady.asObservable();
    }
}

export default new GoogleApiService();