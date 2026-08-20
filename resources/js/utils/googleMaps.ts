declare global {
    interface Window {
        google?: any;
        [callback: string]: any;
    }
}

let carregamentoScript: Promise<void> | null = null;

export function carregarGoogleMaps(apiKey: string): Promise<void> {
    if (window.google?.maps?.Map) {
        return Promise.resolve();
    }

    if (carregamentoScript) {
        return carregamentoScript;
    }

    carregamentoScript = new Promise((resolve, reject) => {
        const nomeCallback = "__onGoogleMapsCarregado";

        window[nomeCallback] = () => {
            delete window[nomeCallback];
            resolve();
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&callback=${nomeCallback}&loading=async`;
        script.async = true;
        script.onerror = () => {
            carregamentoScript = null;
            reject(new Error("Não foi possível carregar o Google Maps"));
        };
        document.head.appendChild(script);
    });

    return carregamentoScript;
}
