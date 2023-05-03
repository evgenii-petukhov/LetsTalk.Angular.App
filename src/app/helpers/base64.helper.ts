const encodeToBase64 = (blob: any) => new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
        resolve(e.target.result);
    };
    reader.readAsDataURL(blob);
});
export { encodeToBase64 };
