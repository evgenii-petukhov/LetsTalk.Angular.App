import { Injectable } from '@angular/core';
import { RpcError } from 'grpc-web';
import { EchoServiceClient } from '../protos/EchoServiceClientPb';
import { ServerStreamingEchoRequest } from '../protos/echo_pb';

@Injectable({
    providedIn: 'root'
})
export class GrpcService {

    constructor() { }

    init():void {
        var echoService = new EchoServiceClient(
            'https://api.letstalk.local');
        var request = new ServerStreamingEchoRequest();
            request.setMessage("42");
            var metadata = {'custom-header-1': 'value1'};
        const stream = echoService.serverStreamingEcho(request, metadata);
        stream.on('data', function(response) {
          console.log(response.getMessage());
        });
        stream.on('status', function(status) {
          console.log(status.code);
          console.log(status.details);
          console.log(status.metadata);
        });
        stream.on('error', (err: RpcError) =>{
            console.error(err);
        });
        stream.on('end', () => {
                // stream end signal
            });
        
        // to close the stream
        //stream.cancel()
    }
}
