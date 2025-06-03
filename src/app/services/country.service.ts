import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

interface RawCountry {
  flags: { svg?: string };
  translations: {
    spa?: { common: string };
  };
}

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,translations';

  constructor(private http: HttpClient) {}

  getAllCountries() {
    return this.http.get<RawCountry[]>(this.API_URL).pipe(
      map((countries) =>
        countries
          .filter(
            (c) =>
              c.translations?.spa?.common &&
              c.flags?.svg &&
              c.flags.svg.trim() !== ''
          )
          .map((c) => ({
            nombre: c.translations!.spa!.common,
            bandera: c.flags!.svg!,
          }))
      )
    );
  }
}
