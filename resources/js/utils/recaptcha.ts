declare global {
    interface Window {
        grecaptcha?: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

let carregamentoScript: Promise<void> | null = null;

function carregarRecaptcha(siteKey: string): Promise<void> {
    if (window.grecaptcha?.execute) {
        return Promise.resolve();
    }

    if (carregamentoScript) {
        return carregamentoScript;
    }

    carregamentoScript = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.onload = () => {
            window.grecaptcha!.ready(() => resolve());
        };
        script.onerror = () => {
            carregamentoScript = null;
            reject(new Error("Não foi possível carregar o reCAPTCHA"));
        };
        document.head.appendChild(script);
    });

    return carregamentoScript;
}

export async function obtemTokenRecaptcha(siteKey: string, acao: string): Promise<string> {
    await carregarRecaptcha(siteKey);

    return window.grecaptcha!.execute(siteKey, { action: acao });
}
