import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class SendMessage {

constructor(public http: HttpClient){

}
    sendPushMessage(titulo, messages, token) {
        const data = {
          notification: {
            title: titulo,
            body: messages
          },
          to: token
        };
        const postData = JSON.stringify(data);
        const url = 'https://fcm.googleapis.com/fcm/send';
        this.http.post(url, postData, {
          headers: new HttpHeaders()
            // put the server key here
            .set('Authorization', 'key=AAAAQTmjiBo:APA91bGQ7D5_ZTyyye5OTGHP0BG-9QVbVtIHt3kfjPJclxPDABYkKSz76g5td2ZWfdDr5pgvYQn9a7HEbHugAT7O2DeOPUuh5QLbvwBZ6MfW5kdOaI1M2tP97xCpSZPVAWqotS5awVm1')
            .set('Content-Type', 'application/json'),
        })
          .subscribe((response: Response) => {
            // console.log(response);
          },
            (error: Response) => {
              console.log(error);
              console.log('error' + error);
            });
      }
}
