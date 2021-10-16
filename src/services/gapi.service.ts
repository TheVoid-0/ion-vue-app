import { Observable, firstValueFrom, AsyncSubject, Subject } from "rxjs";

const SCRIPT = document.createElement('script');
const GAPI_URL = 'https://apis.google.com/js/api.js'

class GoogleApiService {

    private gapi: any;
    private googleAuth: any;
    private _isReady = false;
    private isReadySubAsync: AsyncSubject<boolean> = new AsyncSubject<boolean>();
    private signInStateChangeSubject: Subject<boolean> = new Subject<boolean>();

    constructor() {
        console.log('construtor');

        SCRIPT.type = "text/javascript"
        SCRIPT.src = GAPI_URL
        SCRIPT.onload = this.onLoad.bind(this);
        SCRIPT.setAttribute('onreadystatechange', 'SCRIPT.onload')
        document.getElementsByTagName('head')[0].appendChild(SCRIPT)
    }

    private async onLoad() {
        console.log('onload')

        if (!(SCRIPT as any).readyState || /loaded|complete/.test((SCRIPT as any).readyState)) {
            this.gapi = (window as any).gapi;
            this.gapi.load('client:auth2', this.initClient.bind(this));
            console.log('SCRIPT carregado', this.gapi)
        } else {
            console.log('Script não carregou corretamente')
            this.isReadySubAsync.error('Não carregou corretamente');
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

            this.initSignInStateListener();

            this.isReadySubAsync.next(this._isReady = true);
            this.isReadySubAsync.complete();
        })
    }

    // setSignInStateChangeListener(callback: Function) {
    //     this.googleAuth.isSignedIn.listen(callback);
    // }

    /**
     * A inscrição desse observable não é completada, cabe ao invocador realizar o unsubscribe.
     * @returns um observable na qual o listener receberá a mudança no status de login
     */
    getSignInStateChange(): Observable<boolean> {
        return this.signInStateChangeSubject.asObservable();
    }

    private initSignInStateListener() {
        this.getAuthInstance().then(googleAuth => {
            googleAuth.isSignedIn.listen(() => {
                console.log('signInStateChanged');
                this.signInStateChangeSubject.next(googleAuth.isSignedIn.get());
            });
        });
    }

    /**
     * 
     * @see {@link getAuthInstance} <- prefira usar onde possível, pois o valor retornado por esse observable não será atualizado e poupa a utilização do firstValueFrom já que o toPromise foi depreciado
     * 
     * @returns a instância do GoogleAuth da gapi como valor do observable quando a API estiver pronta. Se a API já estiver carregada quando essa função for chamada, retorna o GoogleAuth imediatamente
     */
    getAuthInstanceAsObservable(): Observable<any> {
        return new Observable(subscribe => {
            this.isReadySubAsync.subscribe({
                next: (ready) => {
                    if (!ready) {
                        subscribe.error('GAPI não está disponível por um erro desconhecido');
                        subscribe.complete();
                        return
                    }
                    this.googleAuth = this.gapi.auth2.getAuthInstance();
                    subscribe.next(this.googleAuth);
                    subscribe.complete();
                }, error: (error) => {
                    subscribe.error(error);
                    subscribe.complete();
                }
            })
        });
    }

    /**
     * 
     * @returns a instância do GoogleAuth da gapi quando estiver pronta. Um erro se não foi possível inicializar
     */
    async getAuthInstance(): Promise<any> {
        if (await firstValueFrom(this.isReadySubAsync)) {
            return this.gapi.auth2.getAuthInstance();
        }
    }

    async getCurrentUser(): Promise<any> {
        const googleAuth = await this.getAuthInstance();
        return googleAuth.currentUser.get();
    }

    /**
     * @returns a instância da gapi como valor do observable quando ela for carregada. Se a API já estiver carregada quando essa função for chamada, retorna a API imediatamente
     */
    onReady(): Observable<any> {
        return new Observable<any>(subscribe => {
            this.isReadySubAsync.subscribe({
                next: (ready: any) => {
                    if (!ready) {
                        subscribe.error('GAPI não está disponível por um erro desconhecido')
                    }

                    subscribe.next(this.gapi);
                    subscribe.complete();
                },
                error: (error: any) => {
                    subscribe.error(error);
                    subscribe.complete();
                }
            })
        });
    }

    isReady(): boolean {
        return this._isReady;
    }
}

export default new GoogleApiService();