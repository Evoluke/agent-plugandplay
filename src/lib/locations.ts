import { Country, State, City } from "country-state-city";

export const COUNTRIES = Country.getAllCountries().map((c) => c.name);

export const STATES = State.getStatesOfCountry("BR").map((s) => s.isoCode);

export const CITIES = City.getCitiesOfCountry("BR").map((c) => c.name);
