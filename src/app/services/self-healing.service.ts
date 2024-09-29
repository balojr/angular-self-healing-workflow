import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, of, retry} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SelfHealingService {
  private apiUrl = 'http://localhost:8080/api'; // Your Spring Boot API URL
  private readonly storageKey = 'pendingRequests';
  private readonly expiryTime = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private http: HttpClient) { }

  sendRequest(endpoint: string, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, payload)
      .pipe(
        retry(3), // Retry the request up to 3 times
        catchError((error: HttpErrorResponse) => {
          console.error('Request failed:', error);
          this.storeRequest(endpoint, payload);
          return of(null);
        })
      );
  }

  private storeRequest(endpoint: string, payload: any) {
    try {
      const pendingRequests = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      pendingRequests.push({ endpoint, payload, timestamp: Date.now() });
    } catch (e) {
      console.error('Error storing request:', e);
    }
  }

  processPendingRequests() {
    try {
      const pendingRequests = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const validRequests = pendingRequests.filter((request: any) => Date.now() - request.timestamp < this.expiryTime);

      validRequests.forEach((request: any) => {
        this.sendRequest(request.endpoint, request.payload).subscribe();
      });

      localStorage.setItem(this.storageKey, JSON.stringify(validRequests));
    } catch (e) {
      console.error('Error processing pending requests:', e);
    }
  }
}
