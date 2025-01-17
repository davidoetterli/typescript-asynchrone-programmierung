import fetch, { Response } from "node-fetch";
import { map, mergeMap } from "rxjs/operators";
import { get } from "./utils";
import { forkJoin } from "rxjs";

/*
Read data from https://swapi.dev/api/people/1 (Luke Skywalker)
and dependent data from swapi to return the following object

{
    name: 'Luke Skywalker',
    height: 172,
    gender: 'male',
    homeworld: 'Tatooine',
    films: [
        {
            title: 'A New Hope',
            director: 'George Lucas',
            release_date: '1977-05-25'
        },
        ... // and all other films
    ]
}

Define an interface of the result type above and all other types as well.

*/

interface Person {
  name: string;
  height: string;
  gender: "male" | "female" | "divers";
  homeworld: string;
  films: string[];
}

export interface PersonInfo {
  name: string;
  height: string;
  gender: "male" | "female" | "divers";
  homeworld: string;
  films: {
    title: string;
    director: string;
    release_date: string;
  }[];
}


// Task 1: write a function using promise based fetch api
type PromiseBasedFunction = () => Promise<PersonInfo>;
export const getLukeSkywalkerInfo: PromiseBasedFunction = () => {
  return fetch("https://swapi.dev/api/people/1").then((response: Response) => {
    return response.json().then((person: Person) => {
      //Now we fetch homeworld from the first Person call
      const homeworldPromis = fetch(person.homeworld).then((res) => res.json());
      //And the films also from the first Person call
      const filmsPromise = Promise.all(
          person.films.map((filmURL: string) => fetch(filmURL).then((res)=> res.json()))
      );

      return Promise.all([homeworldPromis, filmsPromise]).then(([homeworld, films]) => {
        return {
          name: person.name,
          height: person.height,
          gender: person.gender,
          homeworld: homeworld.name,
          films: films.map((film) => ({
            title: film.title,
            director: film.director,
            release_date: film.release_date,
          })),
        } as PersonInfo;
      });
    });
  });
};


// Task 2: write a function using async and await
// see also: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-7.html
type AsyncBasedFunction = () => Promise<PersonInfo>;
export const getLukeSkywalkerInfoAsync: PromiseBasedFunction = async () => {
  const response = await fetch("https://swapi.dev/api/people/1");
  const person = await response.json();

  // Fetch HomeWorld
  const homeworldResponse = await fetch(person.homeworld);
  const homeworld = await homeworldResponse.json();

  // Fetch Movies
  const films = await Promise.all(
      person.films.map(async (filmUrl: string) =>{
        const filmResponse = await fetch(filmUrl);
        return await filmResponse.json();
      })
  );

  return (await {
    name: person.name,
    height: person.height,
    gender: person.gender,
    homeworld: homeworld.name,
    films: films.map((film) => ({
      title: film.title,
      director: film.director,
      release_date: film.release_date,
    })),
  }) as PersonInfo;
};


// Task 3: write a function using Observable based api
// see also: https://rxjs.dev/api/index/function/forkJoin
export const getLukeSkywalkerInfoObservable = () => {
  return get<Person>("https://swapi.dev/api/people/1").pipe(
      mergeMap((person: Person) => {

        // Fetch homeworld
        const homeworld$ = get<{ name: string }>(person.homeworld).pipe(
            map((homeworld) => homeworld.name)
        );

        // fetch films
        const films$ = forkJoin(
            person.films.map((filmUrl) =>
                get<{
                  title: string;
                  director: string;
                  release_date: string;
                }>(filmUrl).pipe(
                    map((film) => ({
                      title: film.title,
                      director: film.director,
                      release_date: film.release_date,
                    }))
                )
            )
        );

        return forkJoin([homeworld$, films$]).pipe(
            map(([homeworld, films]) => ({
              name: person.name,
              height: person.height,
              gender: person.gender,
              homeworld,
              films,
            } as PersonInfo))
        );
      })
  );
};