const downloadAndEncodeToBase64 = (url: string) => new Promise<string>(async (resolve, reject) => {
    const response = await fetch(url);
    if (response.ok && typeof response.blob === 'function') {
        const blob = await response.blob();
        if (blob) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                resolve(e.target.result);
            };
            reader.readAsDataURL(blob);
            return;
        }
    }
    reject();
});
export { downloadAndEncodeToBase64 };
