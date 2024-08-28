export class MockToastrService {
    info(message: string, title: string) {
        console.log(`Toastr info called with message: ${message}, title: ${title}`);
    }

    success(message: string, title: string) {
        console.log(`Toastr success called with message: ${message}, title: ${title}`);
    }

    error(message: string, title: string) {
        console.log(`Toastr error called with message: ${message}, title: ${title}`);
    }

    warning(message: string, title: string) {
        console.log(`Toastr warning called with message: ${message}, title: ${title}`);
    }
}
